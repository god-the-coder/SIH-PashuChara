from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.batches.services import create_batch_from_inspection
from apps.inspections.models import InspectionType, MaterialType
from apps.inspections.services import (
    create_draft_inspection,
    save_inspection,
    update_inspection_context,
)
from apps.recommendations.models import RecommendationActionType, RecommendationUrgency
from apps.recommendations.services import create_recommendation
from apps.results.models import RiskCategory
from apps.results.services import record_result

from .models import Notification, NotificationType
from .selectors import list_notifications_for_owner, unread_count_for_owner
from .services import (
    BATCH_REMINDER_THRESHOLD_DAYS,
    create_notification,
    generate_batch_reminders,
    mark_all_read,
    mark_notification_read,
    notify_recommendation_created,
    notify_result_created,
    notify_weather_alert,
)


def make_test_image():
    import io

    import numpy as np
    from PIL import Image

    rng = np.random.default_rng(seed=0)
    array = rng.integers(0, 255, (300, 300, 3), dtype='uint8')
    buf = io.BytesIO()
    Image.fromarray(array).save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile('test.jpg', buf.read(), content_type='image/jpeg')


def make_inspection(owner, **kwargs):
    defaults = dict(
        owner=owner, inspection_type=InspectionType.SILAGE,
        material_type=MaterialType.SILAGE, storage_duration_days=5,
    )
    defaults.update(kwargs)
    return create_draft_inspection(**defaults)


class NotificationSelectorAndServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540001', full_name='Owner', password='StrongPass123',
        )

    def test_create_and_list_notifications(self):
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='Hello')
        notifications = list(list_notifications_for_owner(owner=self.owner))
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].title, 'Hello')

    def test_unread_count(self):
        n1 = create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='A')
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='B')
        self.assertEqual(unread_count_for_owner(owner=self.owner), 2)

        mark_notification_read(notification=n1)
        self.assertEqual(unread_count_for_owner(owner=self.owner), 1)

    def test_mark_all_read(self):
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='A')
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='B')
        mark_all_read(owner=self.owner)
        self.assertEqual(unread_count_for_owner(owner=self.owner), 0)


class NotifyResultCreatedTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540002', full_name='Owner', password='StrongPass123',
        )
        self.inspection = make_inspection(self.owner)

    def test_low_risk_does_not_notify(self):
        result = record_result(inspection=self.inspection, risk_category=RiskCategory.LOW, summary='ok')
        notification = notify_result_created(result=result)
        self.assertIsNone(notification)
        self.assertEqual(unread_count_for_owner(owner=self.owner), 0)

    def test_high_risk_notifies(self):
        result = record_result(
            inspection=self.inspection, risk_category=RiskCategory.HIGH, summary='bad', headline='Spoiled',
        )
        notification = notify_result_created(result=result)
        self.assertIsNotNone(notification)
        self.assertEqual(notification.notification_type, NotificationType.RISK_ALERT)
        self.assertEqual(notification.severity, 'CRITICAL')
        self.assertEqual(notification.title, 'Spoiled')
        self.assertEqual(notification.owner_id, self.owner.id)


class NotifyRecommendationCreatedTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540003', full_name='Owner', password='StrongPass123',
        )
        inspection = make_inspection(self.owner)
        self.result = record_result(inspection=inspection, risk_category=RiskCategory.HIGH, summary='bad')

    def test_immediate_urgency_notifies(self):
        recommendation = create_recommendation(
            result=self.result, text='Do not feed', action_type=RecommendationActionType.GENERAL,
            urgency=RecommendationUrgency.IMMEDIATE,
        )
        notification = notify_recommendation_created(recommendation=recommendation)
        self.assertIsNotNone(notification)
        self.assertEqual(notification.notification_type, NotificationType.RECOMMENDATION)

    def test_corrective_urgency_does_not_notify(self):
        recommendation = create_recommendation(
            result=self.result, text='Monitor', action_type=RecommendationActionType.GENERAL,
            urgency=RecommendationUrgency.CORRECTIVE,
        )
        notification = notify_recommendation_created(recommendation=recommendation)
        self.assertIsNone(notification)


class NotifyWeatherAlertTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540004', full_name='Owner', password='StrongPass123',
        )
        self.inspection = make_inspection(self.owner)

    def test_high_humidity_triggers_alert(self):
        self.inspection.humidity_percent = 85
        notification = notify_weather_alert(inspection=self.inspection)
        self.assertIsNotNone(notification)
        self.assertEqual(notification.notification_type, NotificationType.WEATHER_ALERT)

    def test_low_humidity_no_moisture_does_not_trigger(self):
        self.inspection.humidity_percent = 40
        notification = notify_weather_alert(inspection=self.inspection)
        self.assertIsNone(notification)

    def test_moisture_exposure_triggers_alert(self):
        self.inspection.moisture_exposure = True
        notification = notify_weather_alert(inspection=self.inspection)
        self.assertIsNotNone(notification)

    def test_does_not_duplicate_for_same_inspection(self):
        self.inspection.humidity_percent = 90
        notify_weather_alert(inspection=self.inspection)
        second = notify_weather_alert(inspection=self.inspection)
        self.assertIsNone(second)
        self.assertEqual(
            Notification.objects.filter(inspection=self.inspection, notification_type=NotificationType.WEATHER_ALERT).count(),
            1,
        )

    def test_update_inspection_context_triggers_weather_alert_end_to_end(self):
        with patch('apps.inspections.services.fetch_current_weather') as mock_weather:
            mock_weather.return_value = {'temperature_celsius': 30, 'humidity_percent': 88}
            update_inspection_context(inspection=self.inspection, latitude=28.6, longitude=77.2)

        notifications = list(list_notifications_for_owner(owner=self.owner))
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].notification_type, NotificationType.WEATHER_ALERT)


class GenerateBatchRemindersTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540005', full_name='Owner', password='StrongPass123',
        )

    def _saved_inspection_with_batch(self, days_ago):
        inspection = make_inspection(self.owner)
        inspection.images.create(image=make_test_image())
        save_inspection(inspection=inspection)
        batch = create_batch_from_inspection(inspection=inspection)
        inspection.batch = batch
        inspection.saved_at = timezone.now() - timedelta(days=days_ago)
        inspection.save(update_fields=['batch', 'saved_at'])
        return batch

    def test_stale_batch_gets_reminder(self):
        self._saved_inspection_with_batch(days_ago=BATCH_REMINDER_THRESHOLD_DAYS + 1)
        generate_batch_reminders(owner=self.owner)
        self.assertEqual(
            Notification.objects.filter(owner=self.owner, notification_type=NotificationType.BATCH_REMINDER).count(),
            1,
        )

    def test_recent_batch_gets_no_reminder(self):
        self._saved_inspection_with_batch(days_ago=1)
        generate_batch_reminders(owner=self.owner)
        self.assertEqual(
            Notification.objects.filter(owner=self.owner, notification_type=NotificationType.BATCH_REMINDER).count(),
            0,
        )

    def test_does_not_duplicate_within_cooldown(self):
        self._saved_inspection_with_batch(days_ago=BATCH_REMINDER_THRESHOLD_DAYS + 1)
        generate_batch_reminders(owner=self.owner)
        generate_batch_reminders(owner=self.owner)
        self.assertEqual(
            Notification.objects.filter(owner=self.owner, notification_type=NotificationType.BATCH_REMINDER).count(),
            1,
        )


class NotificationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            phone_number='+919876540006', full_name='Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876540007', full_name='Other', password='StrongPass123',
        )

    def test_list_requires_authentication(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, 403)

    def test_list_returns_only_own_notifications(self):
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='Mine')
        create_notification(owner=self.other, notification_type=NotificationType.SYSTEM, title='Not mine')

        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Mine')

    def test_unread_count_endpoint(self):
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='A')
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)

    def test_mark_read_endpoint(self):
        notification = create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='A')
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(f'/api/notifications/{notification.pk}/read/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['is_read'])

    def test_mark_read_denies_other_user(self):
        notification = create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='A')
        self.client.force_authenticate(user=self.other)
        response = self.client.patch(f'/api/notifications/{notification.pk}/read/')
        self.assertEqual(response.status_code, 403)

    def test_mark_all_read_endpoint(self):
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='A')
        create_notification(owner=self.owner, notification_type=NotificationType.SYSTEM, title='B')
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(unread_count_for_owner(owner=self.owner), 0)


class AnalyzeInspectionNotificationIntegrationTests(TestCase):
    """Confirms the real analyze_inspection flow (not just the notify_* helpers in
    isolation) creates the expected alerts end-to-end."""

    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540008', full_name='Owner', password='StrongPass123',
        )

    def test_high_risk_analysis_creates_risk_and_recommendation_notifications(self):
        from apps.results.services import analyze_inspection

        inspection = make_inspection(self.owner)
        inspection.images.create(image=make_test_image())

        with patch('apps.results.services.analyze_material') as mock_analyze:
            mock_analyze.return_value = {
                'summary': 'Severe mould detected', 'headline': 'High Risk',
                'confidence': 90, 'indicators': [{'severity': 'severe'}],
            }
            analyze_inspection(inspection=inspection)

        notifications = list(list_notifications_for_owner(owner=self.owner))
        types = {notification.notification_type for notification in notifications}
        self.assertIn(NotificationType.RISK_ALERT, types)
        self.assertIn(NotificationType.RECOMMENDATION, types)
