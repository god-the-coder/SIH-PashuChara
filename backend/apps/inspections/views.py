from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.batches.services import ensure_batch_for_inspection

from .models import Inspection
from .permissions import IsInspectionOwner
from .selectors import list_inspections_by_owner
from .serializers import CreateInspectionSerializer, InspectionImageSerializer, InspectionSerializer
from .services import add_inspection_image, create_draft_inspection, save_inspection


class InspectionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        inspections = list_inspections_by_owner(owner=request.user)
        return Response(InspectionSerializer(inspections, many=True).data)

    def post(self, request):
        serializer = CreateInspectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            inspection = create_draft_inspection(owner=request.user, **serializer.validated_data)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(InspectionSerializer(inspection).data, status=status.HTTP_201_CREATED)


class InspectionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    def get(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)
        return Response(InspectionSerializer(inspection).data)


class InspectionImageUploadView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        serializer = InspectionImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            image = add_inspection_image(inspection=inspection, image=serializer.validated_data['image'])
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(InspectionImageSerializer(image).data, status=status.HTTP_201_CREATED)


class InspectionSaveView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        try:
            inspection = save_inspection(inspection=inspection)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        ensure_batch_for_inspection(inspection=inspection)
        inspection.refresh_from_db()

        return Response(InspectionSerializer(inspection).data)
