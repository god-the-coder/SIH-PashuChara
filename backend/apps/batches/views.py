from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.results.serializers import BatchTrendSerializer
from apps.results.services import build_batch_trend

from .models import Batch
from .permissions import IsBatchOwner
from .selectors import get_batch_by_code, list_batches_by_owner
from .serializers import BatchSerializer, BatchSummarySerializer
from .services import generate_batch_qr_png, update_batch


class BatchListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['batches'], operation_id='batches_list', responses=BatchSerializer(many=True))
    def get(self, request):
        batches = list_batches_by_owner(owner=request.user)
        return Response(BatchSerializer(batches, many=True).data)


class BatchDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBatchOwner]

    @extend_schema(tags=['batches'], operation_id='batches_retrieve', responses=BatchSerializer)
    def get(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)
        return Response(BatchSerializer(batch).data)

    @extend_schema(tags=['batches'], operation_id='batches_partial_update', request=BatchSerializer, responses=BatchSerializer)
    def patch(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)

        serializer = BatchSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        batch = update_batch(batch=batch, **serializer.validated_data)
        return Response(BatchSerializer(batch).data)


class BatchTrendView(APIView):
    permission_classes = [IsAuthenticated, IsBatchOwner]

    @extend_schema(tags=['batches'], operation_id='batches_trend', responses=BatchTrendSerializer)
    def get(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)

        return Response(build_batch_trend(batch=batch))


class BatchQRView(APIView):
    permission_classes = [IsAuthenticated, IsBatchOwner]

    @extend_schema(
        tags=['batches'], operation_id='batches_qr',
        responses={200: OpenApiResponse(description='PNG image of the batch QR code')},
    )
    def get(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)

        png_bytes = generate_batch_qr_png(batch=batch)
        return HttpResponse(png_bytes, content_type='image/png')


class BatchResolveByCodeView(APIView):
    permission_classes = [IsAuthenticated, IsBatchOwner]

    @extend_schema(tags=['batches'], operation_id='batches_resolve_by_code', responses=BatchSummarySerializer)
    def get(self, request, batch_code):
        batch = get_batch_by_code(batch_code=batch_code)
        if batch is None:
            raise NotFound('No batch found for this code.')
        self.check_object_permissions(request, batch)

        return Response(BatchSummarySerializer(batch).data)


class PublicBatchReportView(APIView):
    """The QR-code destination: no login required, since whoever scans a
    batch's QR in the physical world (a buyer, a vet, anyone) isn't
    necessarily the farmer who owns the account. Deliberately reuses
    BatchSummarySerializer, which only exposes batch/result fields — no
    owner identity or contact details — so this is safe to leave public."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=['batches'], operation_id='batches_public_report', responses=BatchSummarySerializer)
    def get(self, request, batch_code):
        batch = get_batch_by_code(batch_code=batch_code)
        if batch is None:
            raise NotFound('No report found for this code.')

        return Response(BatchSummarySerializer(batch).data)
