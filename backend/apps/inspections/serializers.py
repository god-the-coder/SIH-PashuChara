from rest_framework import serializers

from .models import Inspection, InspectionImage


class InspectionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionImage
        fields = ('id', 'image', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class InspectionSerializer(serializers.ModelSerializer):
    images = InspectionImageSerializer(many=True, read_only=True)

    class Meta:
        model = Inspection
        fields = (
            'id', 'batch', 'inspection_type', 'material_type', 'material_type_other',
            'storage_duration_days', 'status', 'created_at', 'updated_at', 'saved_at', 'images',
        )
        read_only_fields = ('id', 'batch', 'status', 'created_at', 'updated_at', 'saved_at', 'images')


class CreateInspectionSerializer(serializers.Serializer):
    inspection_type = serializers.ChoiceField(choices=Inspection._meta.get_field('inspection_type').choices)
    material_type = serializers.ChoiceField(choices=Inspection._meta.get_field('material_type').choices)
    material_type_other = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    storage_duration_days = serializers.IntegerField(min_value=0)
