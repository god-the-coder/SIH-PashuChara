from datetime import timedelta

from django.utils import timezone

from apps.recommendations.models import RecommendationUrgency
from apps.results.models import RiskCategory

from .models import Notification, NotificationSeverity, NotificationType
from .selectors import list_notifications_for_owner

# How stale a batch's last SAVED inspection must be before we surface a re-check
# reminder, and how long to wait before offering another one for the same batch.
BATCH_REMINDER_THRESHOLD_DAYS = 4
BATCH_REMINDER_COOLDOWN_DAYS = 2

# Local weather is treated as a spoilage risk factor above this humidity.
HIGH_HUMIDITY_THRESHOLD_PERCENT = 80

_RISK_SEVERITY = {
    RiskCategory.LOW: NotificationSeverity.INFO,
    RiskCategory.CAUTION: NotificationSeverity.WARNING,
    RiskCategory.HIGH: NotificationSeverity.CRITICAL,
    RiskCategory.UNCERTAIN: NotificationSeverity.WARNING,
}


def create_notification(
    *, owner, notification_type, title, body='', severity=NotificationSeverity.INFO,
    action_label='', action_route='', inspection=None, batch=None,
):
    notification = Notification(
        owner=owner,
        notification_type=notification_type,
        severity=severity,
        title=title,
        body=body,
        action_label=action_label,
        action_route=action_route,
        inspection=inspection,
        batch=batch,
    )
    notification.full_clean()
    notification.save()
    return notification


def notify_result_created(*, result):
    """Called right after Gemini analysis + risk classification produce a Result
    (see apps.results.services.analyze_inspection). A LOW-risk result doesn't need
    to interrupt the farmer — only CAUTION/HIGH/UNCERTAIN are pushed as an alert."""
    if result.risk_category == RiskCategory.LOW:
        return None

    inspection = result.inspection
    return create_notification(
        owner=inspection.owner,
        notification_type=NotificationType.RISK_ALERT,
        severity=_RISK_SEVERITY.get(result.risk_category, NotificationSeverity.WARNING),
        title=result.headline or f'{result.get_risk_category_display()} risk detected',
        body=result.summary,
        action_label='Review Result',
        action_route=f'/inspect/{inspection.pk}/result',
        inspection=inspection,
        batch=inspection.batch,
    )


def notify_recommendation_created(*, recommendation):
    """Only IMMEDIATE-urgency recommendations get their own alert — CORRECTIVE and
    VERIFICATION items are already visible on the result screen the farmer is on."""
    if recommendation.urgency != RecommendationUrgency.IMMEDIATE:
        return None

    inspection = recommendation.result.inspection
    return create_notification(
        owner=inspection.owner,
        notification_type=NotificationType.RECOMMENDATION,
        severity=NotificationSeverity.CRITICAL,
        title='Immediate action required',
        body=recommendation.text,
        action_label='View Details',
        action_route=f'/inspect/{inspection.pk}/result',
        inspection=inspection,
        batch=inspection.batch,
    )


def notify_weather_alert(*, inspection):
    """Called from apps.inspections.services.update_inspection_context right after a
    weather fetch succeeds — flags conditions known to accelerate spoilage (heat +
    humidity, or farmer-reported moisture exposure) while the inspection is still open."""
    humidity = inspection.humidity_percent
    high_humidity = humidity is not None and humidity >= HIGH_HUMIDITY_THRESHOLD_PERCENT
    if not high_humidity and not inspection.moisture_exposure:
        return None

    already_alerted = Notification.objects.filter(
        inspection=inspection, notification_type=NotificationType.WEATHER_ALERT,
    ).exists()
    if already_alerted:
        return None

    if high_humidity:
        body = (
            f'Local humidity is {humidity:.0f}% — conditions favour mould growth in '
            'exposed feed/silage. Cover it promptly and recheck soon.'
        )
    else:
        body = 'Moisture exposure was reported for this inspection — watch for early signs of spoilage.'

    return create_notification(
        owner=inspection.owner,
        notification_type=NotificationType.WEATHER_ALERT,
        severity=NotificationSeverity.WARNING,
        title='Weather/moisture risk to your feed',
        body=body,
        action_label='Inspect Now',
        action_route=f'/inspect/new?type={inspection.inspection_type.lower()}',
        inspection=inspection,
        batch=inspection.batch,
    )


def generate_batch_reminders(*, owner):
    """There's no Celery/cron in this stack, so time-based reminders can't be pushed
    on a schedule. Instead, whenever the farmer's notification list is fetched, check
    their batches for staleness and lazily create a reminder if one isn't already
    outstanding within the cooldown window — same effect, no new infrastructure."""
    from apps.batches.selectors import list_batches_by_owner
    from apps.inspections.models import InspectionStatus

    threshold = timezone.now() - timedelta(days=BATCH_REMINDER_THRESHOLD_DAYS)
    cooldown = timezone.now() - timedelta(days=BATCH_REMINDER_COOLDOWN_DAYS)

    for batch in list_batches_by_owner(owner=owner):
        last_inspection = (
            batch.inspections.filter(status=InspectionStatus.SAVED).order_by('-saved_at').first()
        )
        if last_inspection is None or last_inspection.saved_at is None or last_inspection.saved_at > threshold:
            continue

        already_reminded_recently = Notification.objects.filter(
            owner=owner, notification_type=NotificationType.BATCH_REMINDER,
            batch=batch, created_at__gte=cooldown,
        ).exists()
        if already_reminded_recently:
            continue

        create_notification(
            owner=owner,
            notification_type=NotificationType.BATCH_REMINDER,
            severity=NotificationSeverity.INFO,
            title=f'Re-check reminder: {batch.batch_label}',
            body=(
                f'{batch.batch_label} was last inspected on {last_inspection.saved_at.date()}. '
                'A quick re-check helps catch spoilage early.'
            ),
            action_label='Re-inspect',
            action_route=f'/inspect/new?type={batch.inspection_type.lower()}&batch={batch.pk}',
            batch=batch,
        )


def mark_notification_read(*, notification):
    if not notification.is_read:
        notification.is_read = True
        notification.save(update_fields=['is_read'])
    return notification


def mark_all_read(*, owner):
    list_notifications_for_owner(owner=owner).filter(is_read=False).update(is_read=True)
