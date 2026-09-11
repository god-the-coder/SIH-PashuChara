from .models import Result


def get_result_by_inspection(*, inspection):
    return Result.objects.filter(inspection=inspection).first()


def list_results_by_batch(*, batch):
    return Result.objects.filter(inspection__batch=batch).order_by('created_at')
