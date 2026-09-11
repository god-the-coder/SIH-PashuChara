from django.db import models

from apps.inspections.models import Inspection


class RiskCategory(models.TextChoices):
    LOW = 'LOW', 'Low'
    CAUTION = 'CAUTION', 'Caution'
    HIGH = 'HIGH', 'High'
    UNCERTAIN = 'UNCERTAIN', 'Uncertain'


class Result(models.Model):
    """AI-generated visual assessment for a saved inspection. Placeholder shape,
    pending the finalized AI output specification (see project_explain.txt § 10)."""

    inspection = models.OneToOneField(
        Inspection,
        on_delete=models.CASCADE,
        related_name='result',
    )
    risk_category = models.CharField(max_length=16, choices=RiskCategory.choices)
    summary = models.TextField()
    confidence = models.FloatField(null=True, blank=True)
    findings = models.JSONField(default=dict, blank=True)
    requires_lab_testing = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Result for inspection #{self.inspection_id} ({self.risk_category})'
