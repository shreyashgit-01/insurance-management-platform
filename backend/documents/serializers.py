from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True
    )

    policy_number = serializers.CharField(
        source="policy.policy_number",
        read_only=True
    )

    class Meta:
        model = Document
        fields = "__all__"