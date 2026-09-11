from django.contrib import admin

from .models import Inspection, InspectionImage


class InspectionImageInline(admin.TabularInline):
    model = InspectionImage
    extra = 0


@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'inspection_type', 'material_type', 'status', 'created_at')
    list_filter = ('inspection_type', 'material_type', 'status')
    search_fields = ('owner__phone_number',)
    inlines = [InspectionImageInline]


@admin.register(InspectionImage)
class InspectionImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'inspection', 'uploaded_at')
