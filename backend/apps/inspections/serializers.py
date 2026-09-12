from rest_framework import serializers

from .models import Inspection, InspectionImage


class InspectionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionImage
        fields = ('id', 'image', 'processed_image', 'image_type', 'uploaded_at')
        read_only_fields = ('id', 'processed_image', 'uploaded_at')


class InspectionSerializer(serializers.ModelSerializer):
    images = InspectionImageSerializer(many=True, read_only=True)

    class Meta:
        model = Inspection
        fields = (
            'id', 'batch', 'inspection_type', 'material_type', 'material_type_other',
            'storage_duration_days', 'status', 'followup_qa',
            'latitude', 'longitude', 'temperature_celsius', 'humidity_percent',
            'storage_condition', 'moisture_exposure', 'farmer_observation',
            'created_at', 'updated_at', 'saved_at', 'images',
        )
        read_only_fields = (
            'id', 'batch', 'status', 'followup_qa',
            'latitude', 'longitude', 'temperature_celsius', 'humidity_percent',
            'storage_condition', 'moisture_exposure', 'farmer_observation',
            'created_at', 'updated_at', 'saved_at', 'images',
        )


class CaptureGuidanceRequestSerializer(serializers.Serializer):
    language = serializers.ChoiceField(
        choices=['hi', 'en', 'mr', 'gu', 'kn', 'ta'], required=False, default='en',
    )


class CreateInspectionSerializer(serializers.Serializer):
    inspection_type = serializers.ChoiceField(choices=Inspection._meta.get_field('inspection_type').choices)
    material_type = serializers.ChoiceField(choices=Inspection._meta.get_field('material_type').choices)
    material_type_other = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    storage_duration_days = serializers.IntegerField(min_value=0)
    batch_id = serializers.IntegerField(required=False)


class FollowupAnswersSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.CharField(allow_blank=True), allow_empty=False)


class InspectionContextSerializer(serializers.Serializer):
    latitude = serializers.FloatField(required=False, min_value=-90, max_value=90)
    longitude = serializers.FloatField(required=False, min_value=-180, max_value=180)
    storage_duration_days = serializers.IntegerField(required=False, min_value=0)
    storage_condition = serializers.ChoiceField(
        choices=Inspection._meta.get_field('storage_condition').choices, required=False,
    )
    moisture_exposure = serializers.BooleanField(required=False)
    farmer_observation = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        has_lat = 'latitude' in attrs
        has_lon = 'longitude' in attrs
        if has_lat != has_lon:
            raise serializers.ValidationError('latitude and longitude must be provided together.')
        return attrs
