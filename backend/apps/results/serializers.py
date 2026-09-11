from rest_framework import serializers

from apps.recommendations.serializers import RecommendationSerializer

from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = Result
        fields = (
            'id', 'risk_category', 'risk_score', 'headline', 'action_label', 'summary', 'confidence',
            'findings', 'requires_lab_testing', 'created_at', 'recommendations',
        )
        read_only_fields = fields


class BatchTrendPointSerializer(serializers.Serializer):
    inspection_id = serializers.IntegerField()
    date = serializers.DateTimeField()
    risk_score = serializers.IntegerField(allow_null=True)
    risk_category = serializers.CharField()
    headline = serializers.CharField(allow_blank=True)


class BatchTrendSerializer(serializers.Serializer):
    points = BatchTrendPointSerializer(many=True)
    is_increasing = serializers.BooleanField()
    insight = serializers.CharField(allow_blank=True)
