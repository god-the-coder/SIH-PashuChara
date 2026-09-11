from django.conf import settings
from django.db import models


class InspectionType(models.TextChoices):
    SILAGE = 'SILAGE', 'Silage'
    FEED = 'FEED', 'Animal Feed'


class MaterialType(models.TextChoices):
    GREEN_FODDER = 'GREEN_FODDER', 'Green Fodder'
    DRY_FODDER = 'DRY_FODDER', 'Dry Fodder'
    SILAGE = 'SILAGE', 'Silage'
    CONCENTRATE_FEED = 'CONCENTRATE_FEED', 'Concentrate Feed'
    OTHER = 'OTHER', 'Other'


class InspectionStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SAVED = 'SAVED', 'Saved'


class StorageCondition(models.TextChoices):
    GOOD = 'GOOD', 'Good'
    FAIR = 'FAIR', 'Fair'
    POOR = 'POOR', 'Poor'


class ImageType(models.TextChoices):
    FRONT_GENERAL = 'FRONT_GENERAL', 'Front / General'
    SIDE_DEPTH = 'SIDE_DEPTH', 'Side / Depth'
    MACRO = 'MACRO', 'Macro'
    STORAGE = 'STORAGE', 'Storage'


class Inspection(models.Model):
    """A farmer's visual inspection session. Temporary (DRAFT) until saved."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='inspections',
    )
    batch = models.ForeignKey(
        'batches.Batch',
        on_delete=models.SET_NULL,
        related_name='inspections',
        null=True,
        blank=True,
    )
    inspection_type = models.CharField(max_length=16, choices=InspectionType.choices)
    material_type = models.CharField(max_length=32, choices=MaterialType.choices)
    material_type_other = models.CharField(max_length=100, blank=True)
    storage_duration_days = models.PositiveIntegerField()
    status = models.CharField(
        max_length=8, choices=InspectionStatus.choices, default=InspectionStatus.DRAFT,
    )
    followup_qa = models.JSONField(default=list, blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    temperature_celsius = models.FloatField(null=True, blank=True)
    humidity_percent = models.FloatField(null=True, blank=True)
    storage_condition = models.CharField(max_length=8, choices=StorageCondition.choices, blank=True)
    moisture_exposure = models.BooleanField(null=True, blank=True)
    farmer_observation = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    saved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.get_inspection_type_display()} inspection #{self.pk} ({self.status})'


class InspectionImage(models.Model):
    """An image captured as part of an inspection session."""

    inspection = models.ForeignKey(
        Inspection,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='inspections/%Y/%m/')
    # A resized/normalized/denoised/sharpened copy of `image` (see imaging.processor) —
    # kept purely as a supplementary, more-visible copy for Gemini and the UI.
    # `image` itself is never modified and remains the primary evidence.
    processed_image = models.ImageField(upload_to='inspections/processed/%Y/%m/', null=True, blank=True)
    image_type = models.CharField(max_length=16, choices=ImageType.choices, default=ImageType.FRONT_GENERAL)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Image #{self.pk} for inspection #{self.inspection_id}'
