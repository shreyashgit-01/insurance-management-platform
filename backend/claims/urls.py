from rest_framework.routers import DefaultRouter
from .views import ClaimViewSet

router = DefaultRouter()

router.register("claims", ClaimViewSet)

urlpatterns = router.urls