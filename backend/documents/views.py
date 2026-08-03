from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "title",
        "customer__name",
        "policy__policy_number",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        queryset = Document.objects.all().order_by("-id")

        if self.request.user.role == "CUSTOMER":
            queryset = queryset.filter(customer__user=self.request.user)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role == "CUSTOMER":
            if serializer.validated_data["customer"].user != self.request.user:
                raise PermissionDenied(
                    "You can only upload documents for yourself."
                )

        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role == "CUSTOMER":
            if serializer.instance.customer.user != self.request.user:
                raise PermissionDenied(
                    "You can only edit your own documents."
                )

        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role == "CUSTOMER":
            raise PermissionDenied(
                "You are not allowed to delete documents."
            )

        instance.delete()