from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.results.selectors import get_latest_result_by_batch
from apps.results.serializers import ResultSerializer

from .models import Batch


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = (
            'id', 'batch_code', 'batch_label', 'inspection_type', 'material_type', 'material_type_other',
            'quantity_kg', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'batch_code', 'inspection_type', 'material_type', 'material_type_other',
            'created_at', 'updated_at',
        )


class BatchSummarySerializer(BatchSerializer):
    """Used after a QR scan resolves a batch — adds the latest SAVED result
    snapshot so the summary screen has something to show immediately."""

    latest_result = serializers.SerializerMethodField()

    class Meta(BatchSerializer.Meta):
        fields = BatchSerializer.Meta.fields + ('latest_result',)
        read_only_fields = fields

    @extend_schema_field(ResultSerializer(allow_null=True))
    def get_latest_result(self, obj):
        latest = get_latest_result_by_batch(batch=obj)
        return ResultSerializer(latest).data if latest else None
