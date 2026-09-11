from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

from .managers import UserManager

phone_number_validator = RegexValidator(
    regex=r'^\+?\d{10,15}$',
    message='Enter a valid phone number (10-15 digits, optional leading +).',
)


class User(AbstractBaseUser, PermissionsMixin):
    """Farmer account identity, authenticated by phone number."""

    phone_number = models.CharField(
        max_length=16,
        unique=True,
        validators=[phone_number_validator],
    )
    full_name = models.CharField(max_length=150)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.phone_number
