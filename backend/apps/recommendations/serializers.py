from rest_framework import serializers

from .models import Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ('id', 'text', 'action_type', 'urgency', 'created_at')
        read_only_fields = fields
