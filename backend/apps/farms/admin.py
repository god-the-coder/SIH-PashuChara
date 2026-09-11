from django.contrib import admin

from .models import Farm


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'owner', 'location', 'created_at')
    search_fields = ('farm_name', 'location', 'owner__phone_number')

