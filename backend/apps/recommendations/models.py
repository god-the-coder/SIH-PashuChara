from django.db import models

from apps.results.models import Result


class RecommendationActionType(models.TextChoices):
    GENERAL = 'GENERAL', 'General'
    SELL_FEED = 'SELL_FEED', 'Sell / Waste Disposal'
    LAB_TEST = 'LAB_TEST', 'Lab Testing'
    VET_SUPPORT = 'VET_SUPPORT', 'Veterinary Support'


class RecommendationUrgency(models.TextChoices):
    IMMEDIATE = 'IMMEDIATE', 'Immediate Action'
    CORRECTIVE = 'CORRECTIVE', 'Corrective Action'
    VERIFICATION = 'VERIFICATION', 'Verification'


class Recommendation(models.Model):
    """A single actionable piece of guidance generated from an inspection result."""

    result = models.ForeignKey(
        Result,
        on_delete=models.CASCADE,
        related_name='recommendations',
    )
    text = models.TextField()
    action_type = models.CharField(
        max_length=16, choices=RecommendationActionType.choices, default=RecommendationActionType.GENERAL,
    )
    urgency = models.CharField(
        max_length=16, choices=RecommendationUrgency.choices, default=RecommendationUrgency.CORRECTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.text[:50]
