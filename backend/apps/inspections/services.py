import mimetypes

from django.core.exceptions import ValidationError
from django.utils import timezone

from ai.client import generate_followup_questions as ai_generate_followup_questions
from weather.client import fetch_current_weather
from weather.exceptions import WeatherServiceError

from .models import ImageType, Inspection, InspectionImage, InspectionStatus, MaterialType


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


def add_inspection_image(*, inspection, image, image_type=ImageType.FRONT_GENERAL):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Cannot add images to an inspection that is not in draft.')

    return InspectionImage.objects.create(inspection=inspection, image=image, image_type=image_type)


def save_inspection(*, inspection):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Only a draft inspection can be saved.')

    inspection.status = InspectionStatus.SAVED
    inspection.saved_at = timezone.now()
    inspection.save(update_fields=['status', 'saved_at'])
    return inspection


def update_inspection_context(
    *, inspection, latitude=None, longitude=None, storage_condition=None,
    moisture_exposure=None, farmer_observation=None,
):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Inspection context can only be updated while in draft.')

    update_fields = []

    if latitude is not None and longitude is not None:
        inspection.latitude = latitude
        inspection.longitude = longitude
        update_fields += ['latitude', 'longitude']

        try:
            weather = fetch_current_weather(latitude=latitude, longitude=longitude)
            inspection.temperature_celsius = weather['temperature_celsius']
            inspection.humidity_percent = weather['humidity_percent']
            update_fields += ['temperature_celsius', 'humidity_percent']
        except WeatherServiceError:
            # Weather is enrichment, not a hard requirement — the farmer should
            # never be blocked from proceeding because a third-party API failed.
            pass

    if storage_condition is not None:
        inspection.storage_condition = storage_condition
        update_fields.append('storage_condition')

    if moisture_exposure is not None:
        inspection.moisture_exposure = moisture_exposure
        update_fields.append('moisture_exposure')

    if farmer_observation is not None:
        inspection.farmer_observation = farmer_observation
        update_fields.append('farmer_observation')

    if update_fields:
        inspection.full_clean()
        inspection.save(update_fields=update_fields)

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
