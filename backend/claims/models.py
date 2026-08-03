from django.db import models
from policies.models import Policy

from django.conf import settings
class Claim(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name="claims"
    )

    claim_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    reason = models.TextField()

    submission_date = models.DateField(auto_now_add=True)

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"{self.policy.policy_number} - {self.status}"

    approved_by = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="approved_claims",
)

approved_at = models.DateTimeField(
    null=True,
    blank=True,
)