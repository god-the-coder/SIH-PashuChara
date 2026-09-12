from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.inspections.models import Inspection


class RiskCategory(models.TextChoices):
    LOW = 'LOW', 'Low'
    CAUTION = 'CAUTION', 'Caution'
    HIGH = 'HIGH', 'High'
    UNCERTAIN = 'UNCERTAIN', 'Uncertain'


class Result(models.Model):
    """AI-generated visual assessment for an inspection. Structure agreed against
    the PashuiChara inspection-report mockups (risk trend, detailed report)."""

    inspection = models.OneToOneField(
        Inspection,
        on_delete=models.CASCADE,
        related_name='result',
    )
    risk_category = models.CharField(max_length=16, choices=RiskCategory.choices)
    risk_score = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    headline = models.CharField(max_length=150, blank=True)
    action_label = models.CharField(max_length=100, blank=True)
    summary = models.TextField()
    confidence = models.FloatField(null=True, blank=True)
    findings = models.JSONField(default=dict, blank=True)
    requires_lab_testing = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Result for inspection #{self.inspection_id} ({self.risk_category})'
