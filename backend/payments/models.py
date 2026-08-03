from django.db import models
from policies.models import Policy


class PremiumPayment(models.Model):

    PAYMENT_STATUS = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
    ]

    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    payment_date = models.DateField()

    due_date = models.DateField()

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="PENDING"
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.transaction_id