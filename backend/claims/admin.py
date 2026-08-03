from django.contrib import admin
from .models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "policy",
        "claim_amount",
        "status",
        "submission_date",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "policy__policy_number",
    )