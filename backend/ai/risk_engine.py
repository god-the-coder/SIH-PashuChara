"""Deterministic v1 rules turning Gemini's raw findings into a risk classification.

This is the "Django Risk Engine" from architecture.txt: Gemini returns structured
visual findings, and this module — not the AI — makes the actual risk call, so the
decision logic stays auditable and owned by the app rather than an LLM's own opinion.

Provisional: thresholds and default recommendation text are a first pass, derived
from architecture.txt's category labels and the inspection-report mockups. Expect
these to be refined once real domain/veterinary review is available.
"""

SEVERITY_WEIGHTS = {'none': 0, 'mild': 25, 'moderate': 55, 'severe': 90}

_CATEGORY_ESCALATION_ORDER = ['LOW', 'CAUTION', 'HIGH']

ACTION_LABELS = {
    'LOW': 'Good practices',
    'CAUTION': 'Corrective actions',
    'HIGH': 'Do not feed',
    'UNCERTAIN': 'Retake / limited assessment',
}

_DEFAULT_RECOMMENDATIONS = {
    'LOW': [
        {'text': 'Continue current storage and feeding practices.', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'},
    ],
    'CAUTION': [
        {'text': 'Monitor the batch closely for further changes.', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'},
        {'text': 'Consider a lab test to confirm quality before feeding.', 'action_type': 'LAB_TEST', 'urgency': 'VERIFICATION'},
    ],
    'HIGH': [
        {'text': 'Do not feed the affected batch.', 'action_type': 'GENERAL', 'urgency': 'IMMEDIATE'},
        {'text': 'Isolate the affected material.', 'action_type': 'GENERAL', 'urgency': 'IMMEDIATE'},
        {'text': 'Prevent further moisture exposure.', 'action_type': 'GENERAL', 'urgency': 'IMMEDIATE'},
        {'text': 'Improve storage sealing.', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'},
        {'text': 'Inspect surrounding stored material.', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'},
        {'text': 'Explore appropriate non-feed recovery or disposal options.', 'action_type': 'SELL_FEED', 'urgency': 'IMMEDIATE'},
        {'text': 'Consult a veterinary professional for guidance.', 'action_type': 'VET_SUPPORT', 'urgency': 'VERIFICATION'},
        {'text': 'Get laboratory/NIR testing for definitive confirmation.', 'action_type': 'LAB_TEST', 'urgency': 'VERIFICATION'},
    ],
    'UNCERTAIN': [
        {'text': 'Retake images in better lighting for a clearer assessment.', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'},
        {'text': 'Consider lab testing for a definitive answer.', 'action_type': 'LAB_TEST', 'urgency': 'VERIFICATION'},
    ],
}


def classify_risk(findings, history=None):
    """history: prior risk_score values for the same batch, chronological (oldest first)."""
    indicators = findings.get('indicators') or []
    confidence = findings.get('confidence')
    confidence = 0 if confidence is None else confidence

    scored_indicators = [item for item in indicators if not item.get('verify_only')]
    risk_score = max(
        (SEVERITY_WEIGHTS.get(item.get('severity', 'none'), 0) for item in scored_indicators),
        default=0,
    )

    requires_lab_testing = bool(findings.get('requires_lab_testing')) or any(
        item.get('verify_only') for item in indicators
    )

    trend_escalated = False

    if confidence < 50:
        risk_category = 'UNCERTAIN'
        requires_lab_testing = True
    else:
        if risk_score >= 70:
            risk_category = 'HIGH'
        elif risk_score >= 35:
            risk_category = 'CAUTION'
        else:
            risk_category = 'LOW'

        most_recent_prior = history[-1] if history else None
        current_index = _CATEGORY_ESCALATION_ORDER.index(risk_category)
        can_escalate = current_index < len(_CATEGORY_ESCALATION_ORDER) - 1
        if most_recent_prior is not None and risk_score > most_recent_prior and can_escalate:
            trend_escalated = True
            risk_category = _CATEGORY_ESCALATION_ORDER[current_index + 1]

        if risk_category == 'HIGH':
            requires_lab_testing = True

    return {
        'risk_category': risk_category,
        'risk_score': risk_score,
        'action_label': ACTION_LABELS[risk_category],
        'requires_lab_testing': requires_lab_testing,
        'trend_escalated': trend_escalated,
    }


def default_recommendations_for_category(risk_category):
    return list(_DEFAULT_RECOMMENDATIONS[risk_category])
