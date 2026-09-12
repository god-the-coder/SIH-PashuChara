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
    total_cattle = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.farm_name


class CattleGroup(models.Model):
    """One registered breed/category entry for a farmer's livestock — e.g.
    '8 Sahiwal cows, 120 L/day'. Owned directly by the farmer (not the Farm)
    so cattle records work independently of whether a Farm is registered yet.
    """

    class Category(models.TextChoices):
        COW = 'cow', 'Cow'
        BUFFALO = 'buffalo', 'Buffalo'
        GOAT = 'goat', 'Goat'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cattle_groups',
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    breed = models.CharField(max_length=100)
    count = models.PositiveIntegerField(default=1)
    milk_liters_per_day = models.PositiveIntegerField(default=0)
    lactation_stage = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.breed} x{self.count}'
