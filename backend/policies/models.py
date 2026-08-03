from django.db import models
from customers.models import Customer


class Policy(models.Model):

    POLICY_TYPES = [
        ("HEALTH", "Health Insurance"),
        ("LIFE", "Life Insurance"),
        ("VEHICLE", "Vehicle Insurance"),
        ("HOME", "Home Insurance"),
        ("TRAVEL", "Travel Insurance"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("EXPIRED", "Expired"),
        ("CANCELLED", "Cancelled"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="policies"
    )

    policy_number = models.CharField(
        max_length=50,
        unique=True
    )

    policy_type = models.CharField(
        max_length=20,
        choices=POLICY_TYPES
    )

    premium_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    start_date = models.DateField()
    end_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.policy_number