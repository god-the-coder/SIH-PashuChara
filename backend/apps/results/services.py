from django.core.exceptions import ValidationError

from .models import Result
from .selectors import get_result_by_inspection


def record_result(
    *, inspection, risk_category, summary, risk_score=None, headline='', action_label='',
    confidence=None, findings=None, requires_lab_testing=False,
):
    if get_result_by_inspection(inspection=inspection) is not None:
        raise ValidationError('This inspection already has a result recorded.')

    result = Result(
        inspection=inspection,
        risk_category=risk_category,
        risk_score=risk_score,
        headline=headline,
        action_label=action_label,
        summary=summary,
        confidence=confidence,
        findings=findings or {},
        requires_lab_testing=requires_lab_testing,
    )
    result.full_clean()
    result.save()
    return result
