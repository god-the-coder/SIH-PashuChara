import io
import secrets

import qrcode

from .models import Batch

_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # excludes visually ambiguous chars (0/O, 1/I/L)
_CODE_LENGTH = 8


def _generate_unique_batch_code():
    while True:
        code = 'PC-' + ''.join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_LENGTH))
        if not Batch.objects.filter(batch_code=code).exists():
            return code


def create_batch_from_inspection(*, inspection):
    batch = Batch.objects.create(
        owner=inspection.owner,
        batch_code=_generate_unique_batch_code(),
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


def generate_batch_qr_png(*, batch):
    image = qrcode.make(batch.batch_code)
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return buffer.getvalue()
