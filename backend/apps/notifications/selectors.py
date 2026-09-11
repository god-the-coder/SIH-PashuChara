from .models import Notification


def list_notifications_for_owner(*, owner):
    return Notification.objects.filter(owner=owner).order_by('-created_at')


def unread_count_for_owner(*, owner):
    return Notification.objects.filter(owner=owner, is_read=False).count()


def get_notification_by_id(*, notification_id):
    return Notification.objects.filter(pk=notification_id).first()
