from django.db import connection
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer


@extend_schema(
    summary="Health check",
    description="Check the operational status of the backend API and PostgreSQL database connection.",
    responses={
        200: inline_serializer(
            name="HealthCheckSuccess",
            fields={
                "status": serializers.CharField(),
                "database": serializers.CharField(),
            },
        ),
        503: inline_serializer(
            name="HealthCheckFailure",
            fields={
                "status": serializers.CharField(),
                "database": serializers.CharField(),
                "error": serializers.CharField(),
            },
        ),
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify backend service and database connectivity.
    """
    try:
        connection.ensure_connection()
        return Response(
            {
                "status": "healthy",
                "database": "connected",
            },
            status=status.HTTP_200_OK,
        )
    except Exception as exc:
        return Response(
            {
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(exc),
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
