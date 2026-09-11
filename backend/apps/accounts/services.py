from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import User
from .selectors import get_user_by_phone_number


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
