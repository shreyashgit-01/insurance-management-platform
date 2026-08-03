from rest_framework import serializers
from .models import Claim


class ClaimSerializer(serializers.ModelSerializer):
    policy_number = serializers.CharField(
        source="policy.policy_number",
        read_only=True,
    )

    approved_by_name = serializers.CharField(
        source="approved_by.username",
        read_only=True,
    )

    class Meta:
        model = Claim
        fields = "__all__"