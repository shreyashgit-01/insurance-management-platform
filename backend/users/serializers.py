import re

from django.db import transaction
from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from customers.models import Customer

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["role"] = user.role
        token["id"] = user.id

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["username"] = self.user.username
        data["role"] = self.user.role
        data["id"] = self.user.id

        return data


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    age = serializers.IntegerField()
    gender = serializers.CharField(max_length=10)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    dob = serializers.DateField()
    address = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    confirm_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": ["Passwords do not match."]
            })

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({
                "email": ["A user with this email already exists."]
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("confirm_password")

        name = validated_data["name"]
        phone = validated_data["phone"]

        first_name = re.sub(
            r"[^a-z0-9]",
            "",
            name.split()[0].lower()
        )

        username = f"{first_name}{phone[-4:]}"
        original_username = username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            password=validated_data["password"],
            email=validated_data["email"],
            phone=phone,
            address=validated_data["address"],
            role="CUSTOMER",
        )

        Customer.objects.create(
            user=user,
            name=name,
            age=validated_data["age"],
            gender=validated_data["gender"],
            email=validated_data["email"],
            phone=phone,
            dob=validated_data["dob"],
            address=validated_data["address"],
        )

        return user