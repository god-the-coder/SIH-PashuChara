from .models import Batch


def get_batch_by_id(*, batch_id):
    return Batch.objects.filter(pk=batch_id).first()


def get_batch_by_code(*, batch_code):
    return Batch.objects.filter(batch_code=batch_code).first()


def list_batches_by_owner(*, owner):
    return Batch.objects.filter(owner=owner).order_by('-created_at')
