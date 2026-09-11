from django.core.exceptions import ValidationError

from ai.client import analyze_material
from ai.risk_engine import classify_risk, default_recommendations_for_category
from apps.inspections.services import read_inspection_images
from apps.recommendations.services import create_recommendation

from .models import Result
from .selectors import get_result_by_inspection, list_results_by_batch


def analyze_inspection(*, inspection):
    if get_result_by_inspection(inspection=inspection) is not None:
        raise ValidationError('This inspection already has a result recorded.')

    images = read_inspection_images(inspection=inspection)
    if not images:
        raise ValidationError('At least one image is required before analysis.')

    findings = analyze_material(
        inspection_type=inspection.inspection_type,
        material_type=inspection.material_type,
        material_type_other=inspection.material_type_other,
        storage_duration_days=inspection.storage_duration_days,
        followup_qa=inspection.followup_qa,
        storage_condition=inspection.storage_condition,
        moisture_exposure=inspection.moisture_exposure,
        farmer_observation=inspection.farmer_observation,
        temperature_celsius=inspection.temperature_celsius,
        humidity_percent=inspection.humidity_percent,
        images=images,
    )

    history = []
    if inspection.batch_id:
        history = [
            result.risk_score
            for result in list_results_by_batch(batch=inspection.batch)
            if result.risk_score is not None
        ]

    risk = classify_risk(findings, history=history)

    result = record_result(
        inspection=inspection,
        risk_category=risk['risk_category'],
        risk_score=risk['risk_score'],
        headline=findings.get('headline', ''),
        action_label=risk['action_label'],
        summary=findings.get('summary', ''),
        confidence=findings.get('confidence'),
        findings=findings,
        requires_lab_testing=risk['requires_lab_testing'],
    )

    for recommendation in default_recommendations_for_category(risk['risk_category']):
        create_recommendation(
            result=result,
            text=recommendation['text'],
            action_type=recommendation['action_type'],
            urgency=recommendation['urgency'],
        )

    return result


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
