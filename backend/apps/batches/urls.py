from django.urls import path

from .views import BatchDetailView, BatchListView, BatchTrendView

app_name = 'batches'

urlpatterns = [
    path('', BatchListView.as_view(), name='list'),
    path('<int:pk>/', BatchDetailView.as_view(), name='detail'),
    path('<int:pk>/trend/', BatchTrendView.as_view(), name='trend'),
]
