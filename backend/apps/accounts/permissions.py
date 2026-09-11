from rest_framework.permissions import BasePermission


class IsSelf(BasePermission):
    """Allows access only to the account matching the authenticated user."""

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and obj == request.user)
