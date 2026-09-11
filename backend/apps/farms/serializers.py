from rest_framework import serializers

from .models import Farm


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ('id', 'farm_name', 'location', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
