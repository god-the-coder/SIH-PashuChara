from django.contrib import admin

from .models import CattleGroup, Farm


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'owner', 'location', 'total_cattle', 'created_at')
    search_fields = ('farm_name', 'location', 'owner__phone_number')


@admin.register(CattleGroup)
class CattleGroupAdmin(admin.ModelAdmin):
    list_display = ('breed', 'category', 'owner', 'count', 'milk_liters_per_day', 'created_at')
    search_fields = ('breed', 'owner__phone_number')
    list_filter = ('category',)

