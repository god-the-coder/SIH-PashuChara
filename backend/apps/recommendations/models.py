from django.db import models

from apps.results.models import Result


class Recommendation(models.Model):
    """A single actionable piece of guidance generated from an inspection result."""

    result = models.ForeignKey(
        Result,
        on_delete=models.CASCADE,
        related_name='recommendations',
    )
    text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.text[:50]
