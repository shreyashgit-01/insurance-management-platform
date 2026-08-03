from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Claim
from .serializers import ClaimSerializer


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "policy__policy_number",
        "status",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Claim.objects.all().order_by("-id")

        if user.role == "AGENT":
            return Claim.objects.all().order_by("-id")

        return Claim.objects.filter(
            policy__customer__user=user
        ).order_by("-id")

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "CUSTOMER":
            policy = serializer.validated_data["policy"]

            if policy.customer.user != user:
                raise PermissionDenied(
                    "You can only create claims for your own policies."
                )

            serializer.save(status="PENDING")
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        claim = self.get_object()

        if user.role == "CUSTOMER":
            if claim.policy.customer.user != user:
                raise PermissionDenied(
                    "You cannot edit this claim."
                )

            if claim.status != "PENDING":
                raise PermissionDenied(
                    "Approved or rejected claims cannot be edited."
                )

            if "status" in serializer.validated_data:
                raise PermissionDenied(
                    "You cannot approve or reject claims."
                )

                serializer.save()

        else:
            updated_claim = serializer.save()

            if updated_claim.status in ["APPROVED", "REJECTED"]:
                updated_claim.approved_by = user
                updated_claim.approved_at = timezone.now()
            else:
                updated_claim.approved_by = None
                updated_claim.approved_at = None

            updated_claim.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "CUSTOMER":
            raise PermissionDenied(
                "Customers cannot delete claims."
            )

        instance.delete()