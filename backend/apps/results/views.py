from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.inspections.models import Inspection

from .selectors import get_result_by_inspection
from .serializers import ResultSerializer


class ResultDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, inspection_id):
        inspection = get_object_or_404(Inspection, pk=inspection_id)

        if inspection.owner_id != request.user.id:
            raise PermissionDenied()

        result = get_result_by_inspection(inspection=inspection)
        if result is None:
            raise NotFound('No result recorded yet for this inspection.')

        return Response(ResultSerializer(result).data)
