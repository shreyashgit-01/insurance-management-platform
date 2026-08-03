from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()

    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "email",
        "phone",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Customer.objects.all().order_by("-id")

        if user.role == "AGENT":
            return Customer.objects.all().order_by("-id")

        return Customer.objects.filter(
            user=user
        ).order_by("-id")