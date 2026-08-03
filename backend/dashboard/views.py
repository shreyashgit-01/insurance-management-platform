from calendar import month_abbr

from django.db.models import Sum
from django.http import JsonResponse
from django.utils import timezone

from customers.models import Customer
from policies.models import Policy
from claims.models import Claim
from payments.models import PremiumPayment


def dashboard_summary(request):
    # ------------------------
    # Customers
    # ------------------------
    total_customers = Customer.objects.count()

    # ------------------------
    # Policies
    # ------------------------
    active_policies = Policy.objects.filter(status="ACTIVE").count()
    expired_policies = Policy.objects.filter(status="EXPIRED").count()
    cancelled_policies = Policy.objects.filter(status="CANCELLED").count()

    # ------------------------
    # Claims
    # ------------------------
    total_claims = Claim.objects.count()
    pending_claims = Claim.objects.filter(status="PENDING").count()
    approved_claims = Claim.objects.filter(status="APPROVED").count()
    rejected_claims = Claim.objects.filter(status="REJECTED").count()

    # ------------------------
    # Payments
    # ------------------------
    total_payments = PremiumPayment.objects.count()

    premium_collected = (
        PremiumPayment.objects.filter(payment_status="PAID")
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    pending_amount = (
        PremiumPayment.objects.filter(payment_status="PENDING")
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    # ------------------------
    # Monthly Premium Collection
    # ------------------------
    current_year = timezone.now().year
    monthly_premium = []

    for month in range(1, 13):
        monthly_total = (
            PremiumPayment.objects.filter(
                payment_date__year=current_year,
                payment_date__month=month,
                payment_status="PAID",
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        monthly_premium.append(
            {
                "month": month_abbr[month],
                "amount": float(monthly_total),
            }
        )

    # ------------------------
    # Policy Distribution
    # ------------------------
    policy_distribution = [
        {
            "type": "Health",
            "count": Policy.objects.filter(policy_type="HEALTH").count(),
        },
        {
            "type": "Life",
            "count": Policy.objects.filter(policy_type="LIFE").count(),
        },
        {
            "type": "Vehicle",
            "count": Policy.objects.filter(policy_type="VEHICLE").count(),
        },
        {
            "type": "Home",
            "count": Policy.objects.filter(policy_type="HOME").count(),
        },
        {
            "type": "Travel",
            "count": Policy.objects.filter(policy_type="TRAVEL").count(),
        },
    ]

    # ------------------------
    # Recent Claims
    # ------------------------
    recent_claims = (
        Claim.objects.select_related("policy", "policy__customer")
        .order_by("-submission_date")[:5]
    )

    recent_claims_data = [
        {
            "id": claim.id,
            "customer": claim.policy.customer.name,
            "policy": claim.policy.policy_number,
            "status": claim.status,
            "amount": float(claim.claim_amount),
            "date": claim.submission_date.strftime("%d-%m-%Y")
            if claim.submission_date
            else "-",
        }
        for claim in recent_claims
    ]

    # ------------------------
    # Recent Payments
    # ------------------------
    recent_payments = (
        PremiumPayment.objects.select_related("policy", "policy__customer")
        .order_by("-payment_date")[:5]
    )

    recent_payments_data = [
        {
            "id": payment.id,
            "customer": payment.policy.customer.name,
            "policy": payment.policy.policy_number,
            "amount": float(payment.amount),
            "status": payment.payment_status,
            "date": payment.payment_date.strftime("%d-%m-%Y")
            if payment.payment_date
            else "-",
        }
        for payment in recent_payments
    ]

    # ------------------------
    # Response
    # ------------------------
    return JsonResponse(
        {
            "totalCustomers": total_customers,
            "activePolicies": active_policies,
            "expiredPolicies": expired_policies,
            "cancelledPolicies": cancelled_policies,
            "totalClaims": total_claims,
            "pendingClaims": pending_claims,
            "approvedClaims": approved_claims,
            "rejectedClaims": rejected_claims,
            "totalPayments": total_payments,
            "premiumCollected": float(premium_collected),
            "pendingAmount": float(pending_amount),
            "monthlyPremium": monthly_premium,
            "policyDistribution": policy_distribution,
            "recentClaims": recent_claims_data,
            "recentPayments": recent_payments_data,
        }
    )