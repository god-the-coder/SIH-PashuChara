from .models import Result


def get_result_by_inspection(*, inspection):
    return Result.objects.filter(inspection=inspection).first()
