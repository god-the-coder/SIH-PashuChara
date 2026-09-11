from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'notification_type', 'severity', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'severity', 'is_read')
    search_fields = ('title', 'body', 'owner__phone_number')
