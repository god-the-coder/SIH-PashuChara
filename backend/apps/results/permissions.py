from rest_framework.permissions import BasePermission


class IsResultOwner(BasePermission):
    """Allows access only to the owner of the result's underlying inspection."""

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user and request.user.is_authenticated
            and obj.inspection.owner_id == request.user.id,
        )
