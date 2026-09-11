from django.contrib import admin

from .models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'result', 'text', 'action_type', 'urgency', 'created_at')
    list_filter = ('action_type', 'urgency')
    search_fields = ('text', 'result__inspection__owner__phone_number')
