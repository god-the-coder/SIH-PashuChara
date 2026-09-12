import logging
import random
from datetime import timedelta
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone

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


def authenticate_or_create_google_user(*, email, google_id, full_name='', avatar_url=None):
    """Authenticates or provisions a farmer account via Google Sign-In."""
    if not email:
        raise ValidationError('Google profile must include an email address.')

    user = None
    if google_id:
        user = User.objects.filter(google_id=google_id).first()

    if user is None:
        user = User.objects.filter(email__iexact=email).first()

    if user is None:
        # Generate dummy phone number based on unique identifier if farmer signs up via Google first
        # Format: +99 + 10 digits
        hashed_suffix = str(abs(hash(email)))[:10].ljust(10, '0')
        phone_placeholder = f'+99{hashed_suffix}'

        # Ensure uniqueness
        counter = 1
        while User.objects.filter(phone_number=phone_placeholder).exists():
            phone_placeholder = f'+99{str(abs(hash(email + str(counter))))[:10].ljust(10, "0")}'
            counter += 1

        user = User.objects.create_user(
            phone_number=phone_placeholder,
            full_name=full_name.strip() or email.split('@')[0],
            email=email,
            google_id=google_id,
            password=None,
        )
    else:
        # Link google_id if not linked yet
        if google_id and not user.google_id:
            user.google_id = google_id
            user.save(update_fields=['google_id'])

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

