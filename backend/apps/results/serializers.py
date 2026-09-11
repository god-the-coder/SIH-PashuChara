from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.recommendations.serializers import RecommendationSerializer

from .models import Result
from .services import build_result_comparison


class ResultComparisonSnapshotSerializer(serializers.Serializer):
    inspection_id = serializers.IntegerField()
    date = serializers.DateTimeField(allow_null=True)
    risk_category = serializers.CharField()
    risk_score = serializers.IntegerField(allow_null=True)
    confidence = serializers.IntegerField(allow_null=True)
    headline = serializers.CharField(allow_blank=True)


class ResultComparisonSerializer(serializers.Serializer):
    previous = ResultComparisonSnapshotSerializer()
    current = ResultComparisonSnapshotSerializer()
    risk_score_delta = serializers.IntegerField(allow_null=True)
    confidence_delta = serializers.IntegerField(allow_null=True)
    risk_category_changed = serializers.BooleanField()
    summary = serializers.CharField()


class ResultSerializer(serializers.ModelSerializer):
    recommendations = RecommendationSerializer(many=True, read_only=True)
    comparison = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = (
            'id', 'risk_category', 'risk_score', 'headline', 'action_label', 'summary', 'confidence',
            'findings', 'requires_lab_testing', 'created_at', 'recommendations', 'comparison',
        )
        read_only_fields = fields

    @extend_schema_field(ResultComparisonSerializer(allow_null=True))
    def get_comparison(self, obj):
        return build_result_comparison(result=obj)


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
