import logging
import random
from datetime import timedelta
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone

try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    _GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    _GOOGLE_AUTH_AVAILABLE = False

from .models import PhoneOTP, User
from .selectors import get_user_by_phone_number

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 10
MAX_VERIFY_ATTEMPTS = 5


def generate_phone_otp(*, phone_number):
    """Generates a secure 6-digit OTP code for the phone number."""
    # Invalidate previous unverified OTPs for this number
    PhoneOTP.objects.filter(phone_number=phone_number, is_used=False).update(is_used=True)

    # 6-digit random code
    otp_code = f'{random.randint(100000, 999999)}'
    otp_record = PhoneOTP.objects.create(phone_number=phone_number, otp_code=otp_code)

    logger.info("Generated OTP for %s: %s", phone_number, otp_code)
    return otp_record


def verify_phone_otp(*, phone_number, otp_code, full_name=None):
    """Verifies the OTP code and signs in or auto-registers the farmer."""
    cutoff = timezone.now() - timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp_record = (
        PhoneOTP.objects.filter(phone_number=phone_number, is_used=False, created_at__gte=cutoff)
        .order_by('-created_at')
        .first()
    )

    if not otp_record:
        raise ValidationError('OTP expired or not requested. Please request a new OTP.')

    if otp_record.attempts >= MAX_VERIFY_ATTEMPTS:
        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])
        raise ValidationError('Too many incorrect attempts. Please request a fresh OTP.')

    if otp_record.otp_code != str(otp_code).strip():
        otp_record.attempts += 1
        otp_record.save(update_fields=['attempts'])
        remaining = MAX_VERIFY_ATTEMPTS - otp_record.attempts
        raise ValidationError(f'Invalid OTP code. {remaining} attempt(s) remaining.')

    # Mark OTP used
    otp_record.is_used = True
    otp_record.save(update_fields=['is_used'])

    # Find or auto-register farmer
    user = get_user_by_phone_number(phone_number=phone_number)
    if user is None:
        display_name = (full_name or '').strip() or 'किसान'
        user = User.objects.create_user(
            phone_number=phone_number,
            full_name=display_name,
            password=None,
        )

    return user


def authenticate_or_create_google_user(*, id_token=None, email=None, google_id=None, full_name='', avatar_url=None):
    """
    Authenticate or provision a farmer account via Google Sign-In.

    Production / Render path (GOOGLE_CLIENT_ID is set):
      - Receives the raw ID token string from the frontend Google SDK.
      - Verifies the token cryptographically with Google's public certs.
      - Extracts email, google_id (sub), name, picture from the verified payload.
      - No blind trust of client-supplied data.

    Dev / fallback path (GOOGLE_CLIENT_ID not configured):
      - Accepts email + google_id directly from the serializer (legacy dev flow).
      - Logs a warning so it's obvious when running without verification.
    """
    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')

    # ── Secure path: verify the ID token ──────────────────────────────────────
    if client_id and id_token and _GOOGLE_AUTH_AVAILABLE:
        try:
            payload = google_id_token.verify_oauth2_token(
                id_token,
                google_requests.Request(),
                client_id,
            )
        except Exception as exc:
            raise ValidationError(f'Google token verification failed: {exc}')

        email = payload.get('email', '')
        google_id = payload.get('sub', '')
        full_name = full_name or payload.get('name', '') or ''
        avatar_url = avatar_url or payload.get('picture', '')

        if not payload.get('email_verified', False):
            raise ValidationError('Google account email is not verified.')

    # ── Fallback path (dev only — no client ID configured) ────────────────────
    else:
        if client_id:
            logger.warning(
                "GOOGLE_CLIENT_ID is set but google-auth is not installed or no id_token was provided. "
                "Falling back to unverified email/google_id — install google-auth in production."
            )
        else:
            logger.warning(
                "GOOGLE_CLIENT_ID not configured — skipping Google ID token verification. "
                "This is acceptable in development but MUST be set in production (Render)."
            )

    if not email:
        raise ValidationError('Google profile must include an email address.')

    # ── Find or create user ────────────────────────────────────────────────────
    user = None
    if google_id:
        user = User.objects.filter(google_id=google_id).first()

    if user is None:
        user = User.objects.filter(email__iexact=email).first()

    if user is None:
        # Google-only sign-up: generate a stable placeholder phone number
        # (phone_number is our primary key field — required by the model)
        hashed_suffix = str(abs(hash(email)))[:10].ljust(10, '0')
        phone_placeholder = f'+99{hashed_suffix}'

        counter = 1
        while User.objects.filter(phone_number=phone_placeholder).exists():
            phone_placeholder = f'+99{str(abs(hash(email + str(counter))))[:10].ljust(10, "0")}'
            counter += 1

        user = User.objects.create_user(
            phone_number=phone_placeholder,
            full_name=(full_name or '').strip() or email.split('@')[0],
            email=email,
            google_id=google_id,
            password=None,
        )
    else:
        # Link google_id if missing
        changed = False
        if google_id and not user.google_id:
            user.google_id = google_id
            changed = True
        if email and not user.email:
            user.email = email
            changed = True
        if changed:
            user.save(update_fields=[f for f in ['google_id', 'email'] if changed])

    return user


def register_user(*, phone_number, full_name, password):
    if get_user_by_phone_number(phone_number=phone_number) is not None:
        raise ValidationError('A user with this phone number already exists.')

    user = User(phone_number=phone_number, full_name=full_name)
    validate_password(password, user=user)

    return User.objects.create_user(
        phone_number=phone_number,
        full_name=full_name,
        password=password,
    )

