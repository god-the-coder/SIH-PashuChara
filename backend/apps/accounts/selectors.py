from .models import User


def get_user_by_id(*, user_id):
    return User.objects.filter(pk=user_id).first()


def get_user_by_phone_number(*, phone_number):
    return User.objects.filter(phone_number=phone_number).first()
