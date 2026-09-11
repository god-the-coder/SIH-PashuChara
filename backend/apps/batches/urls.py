from django.urls import path

from .views import BatchDetailView, BatchListView

app_name = 'batches'

urlpatterns = [
    path('', BatchListView.as_view(), name='list'),
    path('<int:pk>/', BatchDetailView.as_view(), name='detail'),
]
