from django.contrib import admin

from .models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'result', 'text', 'created_at')
    search_fields = ('text', 'result__inspection__owner__phone_number')
