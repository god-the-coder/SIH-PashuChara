from .models import Farm


def get_farm_by_owner(*, owner):
    return Farm.objects.filter(owner=owner).first()


def get_farm_by_id(*, farm_id):
    return Farm.objects.filter(pk=farm_id).first()
