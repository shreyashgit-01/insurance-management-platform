from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

from users.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView


def home(request):
    return HttpResponse("<h1>Insurance Management API is Running 🚀</h1>")


urlpatterns = [
    path("", home),

    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),

    # App URLs
    path("api/", include("dashboard.urls")),
    path("api/", include("customers.urls")),
    path("api/", include("policies.urls")),
    path("api/", include("claims.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("documents.urls")),

    # JWT Authentication
    path(
    "api/token/",
    MyTokenObtainPairView.as_view(),
    name="token_obtain_pair",
    ),
    
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )