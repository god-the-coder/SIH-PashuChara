from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import Inspection, InspectionImage, InspectionStatus, MaterialType


def create_draft_inspection(*, owner, inspection_type, material_type, storage_duration_days, material_type_other=''):
    if material_type == MaterialType.OTHER and not material_type_other:
        raise ValidationError('material_type_other is required when material_type is Other.')

    inspection = Inspection(
        owner=owner,
        inspection_type=inspection_type,
        material_type=material_type,
        material_type_other=material_type_other,
        storage_duration_days=storage_duration_days,
    )
    inspection.full_clean()
    inspection.save()
    return inspection


def add_inspection_image(*, inspection, image):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Cannot add images to an inspection that is not in draft.')

    return InspectionImage.objects.create(inspection=inspection, image=image)


def save_inspection(*, inspection):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Only a draft inspection can be saved.')

    inspection.status = InspectionStatus.SAVED
    inspection.saved_at = timezone.now()
    inspection.save(update_fields=['status', 'saved_at'])
    return inspection
