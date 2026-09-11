from rest_framework import serializers

from .models import Batch


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = (
            'id', 'batch_label', 'inspection_type', 'material_type', 'material_type_other',
            'quantity_kg', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'inspection_type', 'material_type', 'material_type_other', 'created_at', 'updated_at')
