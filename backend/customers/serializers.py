from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Customer

User = get_user_model()


class CustomerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)

    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
)

    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "age",
            "gender",
            "email",
            "phone",
            "dob",
            "address",
            "username",
            "password",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError(
                {"username": "Username already exists."}
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            role="CUSTOMER",
        )

        customer = Customer.objects.create(
            user=user,
            **validated_data
        )

        return customer

    def update(self, instance, validated_data):
        validated_data.pop("username", None)
        validated_data.pop("password", None)

        return super().update(instance, validated_data)