from django.core.exceptions import ValidationError

from .models import CattleGroup, Farm
from .selectors import get_farm_by_owner


def create_farm(*, owner, farm_name, location, total_cattle=0):
    if get_farm_by_owner(owner=owner) is not None:
        raise ValidationError('This farmer already has a farm registered.')

    return Farm.objects.create(
        owner=owner, farm_name=farm_name, location=location, total_cattle=total_cattle,
    )


def update_farm(*, farm, farm_name=None, location=None, total_cattle=None):
    if farm_name is not None:
        farm.farm_name = farm_name
    if location is not None:
        farm.location = location
    if total_cattle is not None:
        farm.total_cattle = total_cattle

    farm.full_clean()
    farm.save()
    return farm


def create_cattle_group(*, owner, category, breed, count=1, milk_liters_per_day=0, lactation_stage=''):
    group = CattleGroup(
        owner=owner,
        category=category,
        breed=breed,
        count=count,
        milk_liters_per_day=milk_liters_per_day,
        lactation_stage=lactation_stage,
    )
    group.full_clean()
    group.save()
    return group


def delete_cattle_group(*, group):
    group.delete()
