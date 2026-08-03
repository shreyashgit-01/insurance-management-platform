from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import PremiumPayment
from io import BytesIO
import os

from django.conf import settings
from django.http import FileResponse
from django.utils import timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    Image,
)

from rest_framework.decorators import action
from .serializers import PremiumPaymentSerializer


class PremiumPaymentViewSet(viewsets.ModelViewSet):
    queryset = PremiumPayment.objects.all()
    serializer_class = PremiumPaymentSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "transaction_id",
        "policy__policy_number",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "AGENT"]:
            return PremiumPayment.objects.all().order_by("-id")

        return PremiumPayment.objects.filter(
            policy__customer__user=user
        ).order_by("-id")

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "CUSTOMER":
            policy = serializer.validated_data["policy"]

            if policy.customer.user != user:
                raise PermissionDenied(
                    "You can only make payments for your own policies."
                )

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user

        if user.role == "CUSTOMER":
            payment = self.get_object()

            if payment.policy.customer.user != user:
                raise PermissionDenied(
                    "You cannot update this payment."
                )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "CUSTOMER":
            raise PermissionDenied(
                "Customers cannot delete payments."
            )

        instance.delete()

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        payment = self.get_object()

        # Customers can only download their own receipt
        if (
            request.user.role == "CUSTOMER"
            and payment.policy.customer.user != request.user
        ):
            raise PermissionDenied(
                "You can only download your own payment receipt."
            )

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30,
        )

        styles = getSampleStyleSheet()

        heading_style = styles["Heading1"]
        heading_style.alignment = TA_CENTER
        heading_style.textColor = colors.HexColor("#0B5394")

        subheading_style = styles["Heading2"]
        subheading_style.textColor = colors.HexColor("#0B5394")

        normal_style = styles["BodyText"]

        elements = []

        logo_path = os.path.join(
            settings.BASE_DIR,
            "assets",
            "logo.png",
        )

        if os.path.exists(logo_path):
            logo = Image(
                logo_path,
                width=0.8 * inch,
                height=0.8 * inch,
            )
        else:
            logo = Paragraph("", normal_style)

        title = Paragraph(
            """
            <font color="white" size="20">
            <b>INSURANCE MANAGEMENT SYSTEM</b>
            </font><br/>
            <font color="white" size="12">
            PREMIUM PAYMENT RECEIPT
            </font>
            """,
            styles["BodyText"],
        )

        header = Table(
            [[logo, title]],
            colWidths=[70, 390],
        )

        header.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0B5394")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 15),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 15),
                    ("TOPPADDING", (0, 0), (-1, -1), 15),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 15),
                ]
            )
        )

        elements.append(header)
        elements.append(Spacer(1, 20))
        receipt_data = [
            ["Receipt No.", f"PAY-{payment.id:05d}"],
            ["Transaction ID", payment.transaction_id],
            ["Policy Number", payment.policy.policy_number],
            ["Customer Name", payment.policy.customer.name],
            ["Payment Date", payment.payment_date.strftime("%d-%m-%Y")],
            ["Due Date", payment.due_date.strftime("%d-%m-%Y")],
            ["Amount Paid", f"₹ {payment.amount:,.2f}"],
            ["Payment Status", payment.get_payment_status_display()],
        ]

        receipt_table = Table(
            receipt_data,
            colWidths=[170, 290],
        )

        receipt_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EAF3FF")),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#0B5394")),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                    ("GRID", (0, 0), (-1, -1), 0.6, colors.grey),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )

        elements.append(receipt_table)

        elements.append(Spacer(1, 20))

        elements.append(
            Paragraph(
                "PAYMENT TERMS & CONDITIONS",
                subheading_style,
            )
        )

        elements.append(Spacer(1, 8))

        terms = [
            ["✓", "This receipt confirms successful payment of the premium."],
            ["✓", "Please retain this receipt for future reference."],
            ["✓", "This is a system-generated receipt."],
            ["✓", "No physical signature is required."],
            ["✓", "For any discrepancy, contact the Insurance Administrator."],
        ]

        terms_table = Table(
            terms,
            colWidths=[25, 435],
        )

        terms_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )

        elements.append(terms_table)

        elements.append(Spacer(1, 25))
        elements.append(
            Paragraph(
                "<b>Generated By</b>",
                subheading_style,
            )
        )

        elements.append(
            Paragraph(
                "Insurance Management System",
                normal_style,
            )
        )

        elements.append(
            Paragraph(
                f"Generated On : {timezone.now().strftime('%d-%m-%Y %I:%M %p')}",
                normal_style,
            )
        )

        elements.append(Spacer(1, 15))

        signature_table = Table(
            [
                [
                    "",
                    "______________________________",
                ],
                [
                    "",
                    "Authorized Officer",
                ],
            ],
            colWidths=[260, 200],
        )

        signature_table.setStyle(
            TableStyle(
                [
                    ("ALIGN", (1, 0), (1, -1), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )

        elements.append(signature_table)

        elements.append(Spacer(1, 25))

        footer = Paragraph(
            """
            <font size="9" color="grey">
            This is a computer-generated payment receipt issued by the
            Insurance Management System. It serves as proof of premium
            payment and does not require a physical signature or seal.
            </font>
            """,
            normal_style,
        )

        elements.append(footer)

        doc.build(elements)

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"Payment_Receipt_{payment.transaction_id}.pdf",
        )