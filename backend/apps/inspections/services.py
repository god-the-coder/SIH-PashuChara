import mimetypes

from django.core.exceptions import ValidationError
from django.utils import timezone

from ai.client import generate_followup_questions as ai_generate_followup_questions

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


def read_inspection_images(*, inspection):
    images = []
    for inspection_image in inspection.images.all():
        with inspection_image.image.open('rb') as file:
            data = file.read()
        mime_type = mimetypes.guess_type(inspection_image.image.name)[0] or 'image/jpeg'
        images.append((data, mime_type))
    return images


def generate_followup_questions(*, inspection):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Follow-up questions can only be generated for a draft inspection.')

    images = read_inspection_images(inspection=inspection)
    if not images:
        raise ValidationError('At least one image is required before generating follow-up questions.')

    questions = ai_generate_followup_questions(
        inspection_type=inspection.inspection_type,
        material_type=inspection.material_type,
        material_type_other=inspection.material_type_other,
        storage_duration_days=inspection.storage_duration_days,
        images=images,
    )

    inspection.followup_qa = [{'question': question, 'answer': None} for question in questions]
    inspection.save(update_fields=['followup_qa'])
    return inspection


def submit_followup_answers(*, inspection, answers):
    if not inspection.followup_qa:
        raise ValidationError('No follow-up questions were generated for this inspection.')

    if len(answers) != len(inspection.followup_qa):
        raise ValidationError(
            f'Expected {len(inspection.followup_qa)} answers, received {len(answers)}.',
        )

    inspection.followup_qa = [
        {'question': entry['question'], 'answer': answer}
        for entry, answer in zip(inspection.followup_qa, answers)
    ]
    inspection.save(update_fields=['followup_qa'])
    return inspection
