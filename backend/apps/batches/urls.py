from django.urls import path

from .views import BatchDetailView, BatchListView, BatchQRView, BatchResolveByCodeView, BatchTrendView

app_name = 'batches'

urlpatterns = [
    path('', BatchListView.as_view(), name='list'),
    path('by-code/<str:batch_code>/', BatchResolveByCodeView.as_view(), name='resolve-by-code'),
    path('<int:pk>/', BatchDetailView.as_view(), name='detail'),
    path('<int:pk>/trend/', BatchTrendView.as_view(), name='trend'),
    path('<int:pk>/qr/', BatchQRView.as_view(), name='qr'),
]
