from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    RISK_ALERT = 'RISK_ALERT', 'Risk Alert'
    RECOMMENDATION = 'RECOMMENDATION', 'Recommendation'
    BATCH_REMINDER = 'BATCH_REMINDER', 'Batch Re-check Reminder'
    WEATHER_ALERT = 'WEATHER_ALERT', 'Weather Alert'
    SYSTEM = 'SYSTEM', 'System'


class NotificationSeverity(models.TextChoices):
    INFO = 'INFO', 'Info'
    WARNING = 'WARNING', 'Warning'
    CRITICAL = 'CRITICAL', 'Critical'


class Notification(models.Model):
    """An in-app alert surfaced to a farmer. Created synchronously from the
    relevant service function at the moment the triggering event happens
    (result recorded, immediate recommendation, weather risk, stale batch) —
    there's no task queue/scheduler in this stack, so anything time-based
    (see services.generate_batch_reminders) is computed lazily on read."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    severity = models.CharField(max_length=10, choices=NotificationSeverity.choices, default=NotificationSeverity.INFO)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    action_label = models.CharField(max_length=100, blank=True)
    action_route = models.CharField(max_length=200, blank=True)
    inspection = models.ForeignKey(
        'inspections.Inspection', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications',
    )
    batch = models.ForeignKey(
        'batches.Batch', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications',
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.notification_type} for user #{self.owner_id}: {self.title[:40]}'
