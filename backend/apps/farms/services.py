from django.core.exceptions import ValidationError

from .models import Farm
from .selectors import get_farm_by_owner


def create_farm(*, owner, farm_name, location):
    if get_farm_by_owner(owner=owner) is not None:
        raise ValidationError('This farmer already has a farm registered.')

    return Farm.objects.create(owner=owner, farm_name=farm_name, location=location)


def update_farm(*, farm, farm_name=None, location=None):
    if farm_name is not None:
        farm.farm_name = farm_name
    if location is not None:
        farm.location = location

    farm.full_clean()
    farm.save()
    return farm
