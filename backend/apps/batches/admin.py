from django.contrib import admin

from .models import Batch


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batch_label', 'owner', 'inspection_type', 'material_type', 'quantity_kg', 'created_at')
    list_filter = ('inspection_type', 'material_type')
    search_fields = ('batch_label', 'owner__phone_number')

