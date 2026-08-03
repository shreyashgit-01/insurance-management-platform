from rest_framework import serializers
from .models import PremiumPayment


class PremiumPaymentSerializer(serializers.ModelSerializer):
    policy_number = serializers.CharField(
        source="policy.policy_number",
        read_only=True
    )

    class Meta:
        model = PremiumPayment
        fields = "__all__"