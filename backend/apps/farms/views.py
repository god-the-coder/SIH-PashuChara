from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from weather.client import fetch_current_weather
from weather.exceptions import WeatherServiceError

from .selectors import get_farm_by_owner
from .serializers import FarmSerializer
from .services import create_farm, update_farm


class MyFarmView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['farms'], responses=FarmSerializer)
    def get(self, request):
        farm = get_farm_by_owner(owner=request.user)
        if farm is None:
            return Response({'detail': 'No farm registered yet.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FarmSerializer(farm).data)

    @extend_schema(tags=['farms'], request=FarmSerializer, responses=FarmSerializer)
    def post(self, request):
        serializer = FarmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            farm = create_farm(owner=request.user, **serializer.validated_data)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(FarmSerializer(farm).data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=['farms'], request=FarmSerializer, responses=FarmSerializer)
    def patch(self, request):
        farm = get_farm_by_owner(owner=request.user)
        if farm is None:
            return Response({'detail': 'No farm registered yet.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FarmSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        farm = update_farm(farm=farm, **serializer.validated_data)
        return Response(FarmSerializer(farm).data)


class WeatherCurrentView(APIView):
    """Current conditions for the dashboard's weather card, given a client-supplied
    location (browser geolocation) rather than a stored farm coordinate."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['farms'],
        parameters=[
            OpenApiParameter('lat', float, required=True),
            OpenApiParameter('lon', float, required=True),
        ],
    )
    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        if lat is None or lon is None:
            raise ValidationError({'detail': 'lat and lon query params are required.'})

        try:
            latitude = float(lat)
            longitude = float(lon)
        except ValueError:
            raise ValidationError({'detail': 'lat and lon must be numeric.'})

        try:
            weather = fetch_current_weather(latitude=latitude, longitude=longitude)
        except WeatherServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(weather)
