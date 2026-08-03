from django.db import models
from customers.models import Customer
from policies.models import Policy


class Document(models.Model):

    DOCUMENT_TYPES = [
        ("AADHAAR", "Aadhaar Card"),
        ("PAN", "PAN Card"),
        ("POLICY", "Policy Document"),
        ("CLAIM", "Claim Document"),
        ("OTHER", "Other"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name="documents",
        null=True,
        blank=True,
    )

    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES
    )

    title = models.CharField(max_length=100)

    file = models.FileField(
        upload_to="documents/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title