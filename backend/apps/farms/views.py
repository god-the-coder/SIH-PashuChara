from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_farm_by_owner
from .serializers import FarmSerializer
from .services import create_farm, update_farm


class MyFarmView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        farm = get_farm_by_owner(owner=request.user)
        if farm is None:
            return Response({'detail': 'No farm registered yet.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FarmSerializer(farm).data)

    def post(self, request):
        serializer = FarmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            farm = create_farm(owner=request.user, **serializer.validated_data)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(FarmSerializer(farm).data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        farm = get_farm_by_owner(owner=request.user)
        if farm is None:
            return Response({'detail': 'No farm registered yet.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FarmSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        farm = update_farm(farm=farm, **serializer.validated_data)
        return Response(FarmSerializer(farm).data)
