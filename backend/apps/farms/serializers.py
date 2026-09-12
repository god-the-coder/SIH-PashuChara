from rest_framework import serializers

from .models import CattleGroup, Farm


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ('id', 'farm_name', 'location', 'total_cattle', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class CattleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CattleGroup
        fields = ('id', 'category', 'breed', 'count', 'milk_liters_per_day', 'lactation_stage', 'created_at')
        read_only_fields = ('id', 'created_at')
