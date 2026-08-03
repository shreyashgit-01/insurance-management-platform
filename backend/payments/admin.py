from django.contrib import admin
from .models import PremiumPayment


@admin.register(PremiumPayment)
class PremiumPaymentAdmin(admin.ModelAdmin):

    list_display = (
        "transaction_id",
        "policy",
        "amount",
        "payment_status",
        "payment_date",
    )

    search_fields = (
        "transaction_id",
        "policy__policy_number",
    )

    list_filter = (
        "payment_status",
    )