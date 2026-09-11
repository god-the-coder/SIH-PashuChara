from django.core.exceptions import ValidationError

from ai.client import analyze_material
from ai.risk_engine import classify_risk, default_recommendations_for_category
from apps.inspections.models import InspectionStatus
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


def build_batch_trend(*, batch):
    results = list(list_results_by_batch(batch=batch))
    points = [
        {
            'inspection_id': result.inspection_id,
            'date': result.inspection.saved_at,
            'risk_score': result.risk_score,
            'risk_category': result.risk_category,
            'headline': result.headline,
        }
        for result in results
    ]

    is_increasing = (
        len(points) >= 2
        and points[0]['risk_score'] is not None
        and points[-1]['risk_score'] is not None
        and points[-1]['risk_score'] > points[0]['risk_score']
    )

    return {
        'points': points,
        'is_increasing': is_increasing,
        'insight': _build_trend_insight(points),
    }


def _build_trend_insight(points):
    headlines = [point['headline'] for point in points if point['headline']]
    if not headlines:
        return ''

    distinct_sequence = []
    for headline in headlines:
        if not distinct_sequence or distinct_sequence[-1] != headline:
            distinct_sequence.append(headline)

    if len(distinct_sequence) == 1:
        return f'Findings have remained consistent: {distinct_sequence[0]}.'

    progression = ' → '.join(distinct_sequence)
    return (
        f'Observed progression: {progression}. '
        f"Findings progressed from '{distinct_sequence[0]}' to '{distinct_sequence[-1]}' "
        'across the inspection period.'
    )


def build_result_comparison(*, result):
    """Compare `result` against the batch's most recent prior SAVED result, for the
    'Re-inspection Advisory' — shown when a farmer re-inspects a batch they already
    have history for. Returns None when there's nothing to compare against.
    """
    inspection = result.inspection
    if not inspection.batch_id:
        return None

    previous_result = (
        Result.objects.filter(inspection__batch_id=inspection.batch_id, inspection__status=InspectionStatus.SAVED)
        .exclude(inspection_id=inspection.pk)
        .order_by('-inspection__saved_at')
        .first()
    )
    if previous_result is None:
        return None

    def snapshot(entry):
        return {
            'inspection_id': entry.inspection_id,
            'date': entry.inspection.saved_at or entry.inspection.created_at,
            'risk_category': entry.risk_category,
            'risk_score': entry.risk_score,
            'confidence': entry.confidence,
            'headline': entry.headline,
        }

    risk_score_delta = None
    if result.risk_score is not None and previous_result.risk_score is not None:
        risk_score_delta = result.risk_score - previous_result.risk_score

    confidence_delta = None
    if result.confidence is not None and previous_result.confidence is not None:
        confidence_delta = result.confidence - previous_result.confidence

    risk_category_changed = result.risk_category != previous_result.risk_category

    return {
        'previous': snapshot(previous_result),
        'current': snapshot(result),
        'risk_score_delta': risk_score_delta,
        'confidence_delta': confidence_delta,
        'risk_category_changed': risk_category_changed,
        'summary': _build_comparison_summary(
            previous_result=previous_result, result=result, risk_category_changed=risk_category_changed,
        ),
    }


def _build_comparison_summary(*, previous_result, result, risk_category_changed):
    if not risk_category_changed:
        return f'Risk remains {result.risk_category} since your previous inspection of this batch.'
    return (
        f'Risk has changed from {previous_result.risk_category} to {result.risk_category} '
        'since your previous inspection of this batch.'
    )


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
