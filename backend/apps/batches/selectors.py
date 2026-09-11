from .models import Batch


def get_batch_by_id(*, batch_id):
    return Batch.objects.filter(pk=batch_id).first()


def list_batches_by_owner(*, owner):
    return Batch.objects.filter(owner=owner).order_by('-created_at')
