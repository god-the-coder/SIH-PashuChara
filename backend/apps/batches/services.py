from .models import Batch


def create_batch_from_inspection(*, inspection):
    batch = Batch.objects.create(
        owner=inspection.owner,
        batch_label='Batch',
        inspection_type=inspection.inspection_type,
        material_type=inspection.material_type,
        material_type_other=inspection.material_type_other,
    )
    batch.batch_label = f'Batch #{batch.pk}'
    batch.save(update_fields=['batch_label'])
    return batch


def ensure_batch_for_inspection(*, inspection):
    if inspection.batch_id is not None:
        return inspection.batch

    batch = create_batch_from_inspection(inspection=inspection)
    inspection.batch = batch
    inspection.save(update_fields=['batch'])
    return batch


def update_batch(*, batch, batch_label=None, quantity_kg=None):
    if batch_label is not None:
        batch.batch_label = batch_label
    if quantity_kg is not None:
        batch.quantity_kg = quantity_kg

    batch.full_clean()
    batch.save()
    return batch
