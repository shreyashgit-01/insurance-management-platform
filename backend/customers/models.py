from django.db import models
from django.conf import settings


class Customer(models.Model):
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customers"
    )

    name = models.CharField(max_length=100)

    age = models.PositiveIntegerField(null=True, blank=True)

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True,
    )                 

    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=15)

    dob = models.DateField()

    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name