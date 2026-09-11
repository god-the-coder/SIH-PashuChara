from django.conf import settings
from django.db import models


class Farm(models.Model):
    """A farmer's farm-level context. One farm per farmer."""

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farm',
    )
    farm_name = models.CharField(max_length=150)
    location = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.farm_name
