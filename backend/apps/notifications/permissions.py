from rest_framework.permissions import BasePermission


class IsNotificationOwner(BasePermission):
    """Allows access only to the notification's own owner."""

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and obj.owner_id == request.user.id)
