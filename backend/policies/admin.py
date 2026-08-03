from django.contrib import admin
from .models import Policy


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):

    list_display = (
        "policy_number",
        "customer",
        "policy_type",
        "premium_amount",
        "status",
    )

    search_fields = (
        "policy_number",
        "customer__name",
    )

    list_filter = (
        "policy_type",
        "status",
    )