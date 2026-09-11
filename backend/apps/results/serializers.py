from rest_framework import serializers

from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = (
            'id', 'risk_category', 'summary', 'confidence',
            'findings', 'requires_lab_testing', 'created_at',
        )
        read_only_fields = fields
