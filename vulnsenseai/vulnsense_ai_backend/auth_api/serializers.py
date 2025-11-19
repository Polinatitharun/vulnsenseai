from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", 'is_active', 'last_login', 'date_joined']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid username or password")
        else:
            raise serializers.ValidationError("Username and password required")

        attrs["user"] = user
        return attrs

class SystemActivitySerializer(serializers.ModelSerializer):
    performed_by = serializers.StringRelatedField()
    target_user = serializers.StringRelatedField()

    class Meta:
        model = SystemActivity
        fields = '__all__'
