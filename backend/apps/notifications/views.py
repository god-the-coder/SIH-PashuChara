from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .permissions import IsNotificationOwner
from .selectors import list_notifications_for_owner, unread_count_for_owner
from .serializers import NotificationSerializer
from .services import generate_batch_reminders, mark_all_read, mark_notification_read


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['notifications'], operation_id='notifications_list', responses=NotificationSerializer(many=True))
    def get(self, request):
        generate_batch_reminders(owner=request.user)
        notifications = list_notifications_for_owner(owner=request.user)
        return Response(NotificationSerializer(notifications, many=True).data)


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['notifications'], operation_id='notifications_unread_count',
        responses={200: OpenApiResponse(description='{"count": <int>}')},
    )
    def get(self, request):
        return Response({'count': unread_count_for_owner(owner=request.user)})


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated, IsNotificationOwner]

    @extend_schema(tags=['notifications'], operation_id='notifications_mark_read', responses=NotificationSerializer)
    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        self.check_object_permissions(request, notification)

        notification = mark_notification_read(notification=notification)
        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['notifications'], operation_id='notifications_mark_all_read',
        responses={204: OpenApiResponse(description='All notifications marked as read')},
    )
    def post(self, request):
        mark_all_read(owner=request.user)
        return Response(status=204)
