from io import BytesIO

from django.http import FileResponse

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image
import os
from django.conf import settings
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Policy
from .serializers import PolicySerializer
class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all()

    serializer_class = PolicySerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "policy_number",
        "customer__name",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "AGENT"]:
            return Policy.objects.all().order_by("-id")

        return Policy.objects.filter(
            customer__user=user
        ).order_by("-id")
    @action(detail=True, methods=["get"])

    def download(self, request, pk=None):
        policy = self.get_object()
 
        # Extra security for customers
        if (
            request.user.role == "CUSTOMER"
            and policy.customer.user != request.user
        ):
            raise PermissionDenied(
                "You can only download your own policy."
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

        title_style = styles["Heading1"]
        title_style.alignment = TA_CENTER
        title_style.textColor = colors.HexColor("#0B5394")

        heading_style = styles["Heading2"]
        heading_style.textColor = colors.HexColor("#0B5394")

        normal_style = styles["BodyText"]

        elements = []

        header = []

        logo_path = os.path.join(
            settings.BASE_DIR,
            "assets",
            "logo.png",
        )

        if os.path.exists(logo_path):
            logo = Image(
                logo_path,
                width=0.9 * inch,
                height=0.9 * inch,
            )
        else:
            logo = Paragraph("", normal_style)

        title = Paragraph(
            """
            <font color="white" size="20">
            <b>INSURANCE MANAGEMENT SYSTEM</b>
            </font><br/>
            <font color="white" size="12">
            Insurance Policy Certificate
            </font>
            """,
            styles["BodyText"],
        )       

        header.append([logo, title])

        header_table = Table(
            header,
            colWidths=[70, 390],
        )

        header_table.setStyle(
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

        elements.append(header_table)

        elements.append(Spacer(1, 20))

    

        info = [

            ["Certificate No.", f"IMS-{policy.id:05d}"],
            ["Policy Number", policy.policy_number],
            ["Customer Name", policy.customer.name],
            ["Policy Type", policy.get_policy_type_display()],
            ["Premium Amount", f"₹ {policy.premium_amount}"],
            ["Policy Status", policy.status],
            ["Start Date", policy.start_date.strftime("%d-%m-%Y")],
            ["End Date", policy.end_date.strftime("%d-%m-%Y")],

        ]

        table = Table(
            info,
            colWidths=[180, 280]
        )

        table.setStyle(

            TableStyle(

                [

                    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#EAF4FF")),

                    ("BACKGROUND", (0,0), (0,-1), colors.HexColor("#F4F8FC")),

                    ("TEXTCOLOR", (0,0), (0,-1), colors.HexColor("#0B5394")),

                    ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),

                    ("FONTNAME", (1,0), (1,-1), "Helvetica"),

                    ("GRID", (0,0), (-1,-1), 0.5, colors.grey),

                    ("BOTTOMPADDING", (0,0), (-1,-1), 10),

                    ("TOPPADDING", (0,0), (-1,-1), 10),

                    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),

                ]

            )

        )

        elements.append(table)

        elements.append(Spacer(1,20))

        elements.append(
    Paragraph(
        "<font color='#0B5394'><b>TERMS & CONDITIONS</b></font>",
        heading_style,
    )
)

        elements.append(Spacer(1, 10))

        terms = [
            ["✓", "This insurance certificate is electronically generated."],
            ["✓", "It is valid only for the registered policy holder."],
            ["✓", "Any alteration makes this certificate invalid."],
            ["✓", "Keep this document for future reference."],
            ["✓", "Verification can be done through the Insurance Management System."],
        ]

        terms_table = Table(
            terms,
            colWidths=[25, 430],
        )

        terms_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0,0), (-1,-1), colors.whitesmoke),
                    ("GRID", (0,0), (-1,-1), 0.3, colors.lightgrey),
                    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
                    ("TOPPADDING", (0,0), (-1,-1), 8),
                    ("VALIGN", (0,0), (-1,-1), "TOP"),
                ]
            )
        )

        elements.append(terms_table)

        elements.append(Spacer(1,20))

        elements.append(
    Paragraph(
        "<b>Generated By</b>",
        heading_style,
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

        elements.append(Spacer(1,15))

        elements.append(
            Paragraph(
            "______________________________",
                normal_style,
            )
        )       

        elements.append(
            Paragraph(
                "<b>Authorized Officer</b>",
                normal_style,
            )
        )      
        doc.build(elements)

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"Policy_{policy.policy_number}.pdf",
        )