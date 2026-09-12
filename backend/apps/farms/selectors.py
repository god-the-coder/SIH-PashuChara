from .models import CattleGroup, Farm


def get_farm_by_owner(*, owner):
    return Farm.objects.filter(owner=owner).first()


def get_farm_by_id(*, farm_id):
    return Farm.objects.filter(pk=farm_id).first()


def get_cattle_groups_by_owner(*, owner):
    return CattleGroup.objects.filter(owner=owner).order_by('created_at')


def get_cattle_group_by_id(*, group_id):
    return CattleGroup.objects.filter(pk=group_id).first()
