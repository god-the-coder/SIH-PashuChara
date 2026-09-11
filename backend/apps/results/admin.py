from django.contrib import admin

from .models import Result


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'inspection', 'risk_category', 'risk_score', 'requires_lab_testing', 'created_at')
    list_filter = ('risk_category', 'requires_lab_testing')
    search_fields = ('inspection__owner__phone_number',)
