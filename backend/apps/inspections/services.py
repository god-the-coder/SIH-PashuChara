import mimetypes
import os

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.utils import timezone

from ai.client import generate_followup_questions as ai_generate_followup_questions
from imaging.exceptions import ImageProcessingError, ImageValidationError
from imaging.processor import create_processed_copy
from imaging.validator import validate_image
from weather.client import fetch_current_weather
from weather.exceptions import WeatherServiceError

from .models import ImageType, Inspection, InspectionImage, InspectionStatus, MaterialType


def create_draft_inspection(
    *, owner, inspection_type, material_type, storage_duration_days, material_type_other='', batch=None,
):
    if material_type == MaterialType.OTHER and not material_type_other:
        raise ValidationError('material_type_other is required when material_type is Other.')

    if batch is not None and batch.owner_id != owner.id:
        raise ValidationError('Cannot start a re-inspection on a batch you do not own.')

    inspection = Inspection(
        owner=owner,
        batch=batch,
        inspection_type=inspection_type,
        material_type=material_type,
        material_type_other=material_type_other,
        storage_duration_days=storage_duration_days,
    )
    inspection.full_clean()
    inspection.save()
    return inspection


def _processed_filename(original_name):
    base = os.path.splitext(os.path.basename(original_name or 'image'))[0]
    return f'{base}_processed.jpg'


def add_inspection_image(*, inspection, image, image_type=ImageType.FRONT_GENERAL):
    """Validates the upload is a usable photo, then stores it untouched alongside
    a separately-generated processed copy (see imaging.validator/.processor).
    The original is never modified — it stays the primary evidence sent to Gemini,
    with the processed copy attached only as a supplementary, more-visible aid.
    """
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Cannot add images to an inspection that is not in draft.')

    original_bytes = image.read()
    image.seek(0)

    try:
        validate_image(original_bytes)
    except ImageValidationError as exc:
        raise ValidationError(str(exc))

    try:
        processed_bytes = create_processed_copy(original_bytes)
    except ImageProcessingError as exc:
        raise ValidationError(str(exc))

    inspection_image = InspectionImage(inspection=inspection, image=image, image_type=image_type)
    inspection_image.processed_image.save(
        _processed_filename(image.name), ContentFile(processed_bytes), save=False,
    )
    inspection_image.save()
    return inspection_image


def delete_inspection_image(*, inspection, image):
    if inspection.status != InspectionStatus.DRAFT:
        raise ValidationError('Cannot remove images from an inspection that is not in draft.')

    image.delete()


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
    """Original photos only, for the follow-up-questions pass — that prompt doesn't
    need the primary/supplementary distinction analysis does (see below)."""
    images = []
    for inspection_image in inspection.images.all():
        with inspection_image.image.open('rb') as file:
            data = file.read()
        mime_type = mimetypes.guess_type(inspection_image.image.name)[0] or 'image/jpeg'
        images.append((data, mime_type))
    return images


def read_inspection_images_for_analysis(*, inspection):
    """Originals first (primary evidence), then their processed copies
    (supplementary, for visibility only — see imaging.processor). Returns
    (images, primary_count) so the caller can tell Gemini where the split is.
    """
    primary = []
    supplementary = []
    for inspection_image in inspection.images.all():
        with inspection_image.image.open('rb') as file:
            data = file.read()
        mime_type = mimetypes.guess_type(inspection_image.image.name)[0] or 'image/jpeg'
        primary.append((data, mime_type))

        if inspection_image.processed_image:
            with inspection_image.processed_image.open('rb') as file:
                processed_data = file.read()
            processed_mime = mimetypes.guess_type(inspection_image.processed_image.name)[0] or 'image/jpeg'
            supplementary.append((processed_data, processed_mime))

    return primary + supplementary, len(primary)


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
