from django.conf import settings
from django.db import models

from apps.inspections.models import InspectionType, MaterialType


class Batch(models.Model):
    """A persistent real-world quantity of feed/silage the farmer manages."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='batches',
    )
    batch_code = models.CharField(max_length=20, unique=True)
    batch_label = models.CharField(max_length=150)
    inspection_type = models.CharField(max_length=16, choices=InspectionType.choices)
    material_type = models.CharField(max_length=32, choices=MaterialType.choices)
    material_type_other = models.CharField(max_length=100, blank=True)
    quantity_kg = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.batch_label
