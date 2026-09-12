from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

from .managers import UserManager

phone_number_validator = RegexValidator(
    regex=r'^\+?\d{10,15}$',
    message='Enter a valid phone number (10-15 digits, optional leading +).',
)


class Gender(models.TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'
    OTHER = 'other', 'Other'


class User(AbstractBaseUser, PermissionsMixin):
    """Farmer account identity, authenticated by phone number."""

    phone_number = models.CharField(
        max_length=16,
        unique=True,
        validators=[phone_number_validator],
    )
    full_name = models.CharField(max_length=150)

    # Optional personal-profile fields — none of these gate registration or
    # login, so they're all nullable/blank and filled in later from the
    # profile page.
    email = models.EmailField(blank=True)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.phone_number


class PhoneOTP(models.Model):
    """Temporary 6-digit OTP verification for passwordless phone login."""

    phone_number = models.CharField(max_length=16, validators=[phone_number_validator])
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.phone_number} -> {self.otp_code} (used={self.is_used})'

