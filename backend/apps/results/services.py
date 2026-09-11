from django.core.exceptions import ValidationError

from apps.inspections.models import InspectionStatus

from .models import Result
from .selectors import get_result_by_inspection


def record_result(*, inspection, risk_category, summary, confidence=None, findings=None, requires_lab_testing=False):
    if inspection.status != InspectionStatus.SAVED:
        raise ValidationError('A result can only be recorded for a saved inspection.')

    if get_result_by_inspection(inspection=inspection) is not None:
        raise ValidationError('This inspection already has a result recorded.')

    return Result.objects.create(
        inspection=inspection,
        risk_category=risk_category,
        summary=summary,
        confidence=confidence,
        findings=findings or {},
        requires_lab_testing=requires_lab_testing,
    )
