from rest_framework import serializers

from apps.recommendations.serializers import RecommendationSerializer

from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = Result
        fields = (
            'id', 'risk_category', 'summary', 'confidence',
            'findings', 'requires_lab_testing', 'created_at', 'recommendations',
        )
        read_only_fields = fields
