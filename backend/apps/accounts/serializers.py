from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import User
from .services import register_user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'phone_number', 'full_name', 'email', 'age', 'gender', 'avatar', 'date_joined')
        read_only_fields = fields


class UpdateUserSerializer(serializers.ModelSerializer):
    """Phone number is the login identifier and isn't editable here.

    The view always instantiates this with partial=True, so DRF already
    treats every field here as optional per-request.
    """

    class Meta:
        model = User
        fields = ('full_name', 'email', 'age', 'gender', 'avatar')


class RegisterSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    full_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        try:
            return register_user(**validated_data)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)


class SendOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=16)


class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=16)
    otp = serializers.CharField(max_length=6)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)


class GoogleAuthSerializer(serializers.Serializer):
    """
    Accepts the raw Google ID token from the frontend (Firebase / Google Sign-In SDK).
    The backend verifies it server-side — no plain email/google_id trust from the client.
    Falls back to accepting email+google_id directly only when GOOGLE_CLIENT_ID is not configured
    (development / testing convenience).
    """
    id_token = serializers.CharField(required=False, allow_blank=True, help_text="Google ID token from frontend SDK")
    # Legacy / dev-only fields — used when id_token is absent and GOOGLE_CLIENT_ID not set
    email = serializers.EmailField(required=False, allow_blank=True)
    google_id = serializers.CharField(max_length=255, required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    avatar_url = serializers.CharField(required=False, allow_blank=True)

