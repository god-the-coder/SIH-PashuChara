from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RegisterSerializer, UpdateUserSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(tags=['accounts'], request=RegisterSerializer, responses=UserSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    # Session auth's CSRF check only starts applying once a request carries an
    # authenticated session — this guarantees the csrftoken cookie exists the
    # moment that becomes true, so the very next write request can supply it.
    @method_decorator(ensure_csrf_cookie)
    @extend_schema(tags=['accounts'], request=LoginSerializer, responses=UserSerializer)
    def post(self, request):
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')
        user = authenticate(request, username=phone_number, password=password)

        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        response = Response(UserSerializer(user, context={'request': request}).data)
        # Frontend JS can't read the csrftoken cookie once the API is on a
        # different domain from the frontend (browsers never expose another
        # domain's cookies to document.cookie) — this header is the readable
        # equivalent, exposed cross-origin via CORS_EXPOSE_HEADERS.
        response['X-CSRFToken'] = get_token(request)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['accounts'], request=None, responses=None)
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    # Also the app's session-boot check — refreshes the csrftoken cookie for
    # an existing authenticated session (e.g. after cookies were partially cleared).
    @method_decorator(ensure_csrf_cookie)
    @extend_schema(tags=['accounts'], responses=UserSerializer)
    def get(self, request):
        response = Response(UserSerializer(request.user, context={'request': request}).data)
        response['X-CSRFToken'] = get_token(request)
        return response

    @extend_schema(tags=['accounts'], request=UpdateUserSerializer, responses=UserSerializer)
    def patch(self, request):
        serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)

    # Permanently deletes the account and, via on_delete=CASCADE, every farm,
    # inspection, batch and result owned by it.
    @extend_schema(tags=['accounts'], request=None, responses=None)
    def delete(self, request):
        user = request.user
        logout(request)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
