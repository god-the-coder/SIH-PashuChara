from apps.inspections.models import InspectionStatus

from .models import Result


def get_result_by_inspection(*, inspection):
    return Result.objects.filter(inspection=inspection).first()


def list_results_by_batch(*, batch):
    # Only SAVED inspections count as real history — an analyzed-but-abandoned
    # draft should never influence trend escalation or the trend display.
    return Result.objects.filter(
        inspection__batch=batch, inspection__status=InspectionStatus.SAVED,
    ).order_by('inspection__saved_at')
