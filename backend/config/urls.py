"""
URL configuration for PashuChara AI project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from .views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    # Health Check
    path('api/health/', health_check, name='health-check'),
    # Domain APIs
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/farms/', include('apps.farms.urls')),
    path('api/inspections/', include('apps.inspections.urls')),
    path('api/batches/', include('apps.batches.urls')),
    # OpenAPI Schema & Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
