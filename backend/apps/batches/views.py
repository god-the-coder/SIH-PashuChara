from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.results.services import build_batch_trend

from .models import Batch
from .permissions import IsBatchOwner
from .selectors import list_batches_by_owner
from .serializers import BatchSerializer
from .services import update_batch


class BatchListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        batches = list_batches_by_owner(owner=request.user)
        return Response(BatchSerializer(batches, many=True).data)


class BatchDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBatchOwner]

    def get(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)
        return Response(BatchSerializer(batch).data)

    def patch(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)

        serializer = BatchSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        batch = update_batch(batch=batch, **serializer.validated_data)
        return Response(BatchSerializer(batch).data)


class BatchTrendView(APIView):
    permission_classes = [IsAuthenticated, IsBatchOwner]

    def get(self, request, pk):
        batch = get_object_or_404(Batch, pk=pk)
        self.check_object_permissions(request, batch)

        return Response(build_batch_trend(batch=batch))
