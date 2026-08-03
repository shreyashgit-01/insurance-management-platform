from rest_framework.routers import DefaultRouter

from .views import PremiumPaymentViewSet

router = DefaultRouter()

router.register("payments", PremiumPaymentViewSet)

urlpatterns = router.urls