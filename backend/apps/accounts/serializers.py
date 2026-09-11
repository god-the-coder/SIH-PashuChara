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
