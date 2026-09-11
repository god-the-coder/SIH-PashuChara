from django.urls import path

from .views import (
    InspectionDetailView,
    InspectionImageUploadView,
    InspectionListCreateView,
    InspectionSaveView,
)

app_name = 'inspections'

urlpatterns = [
    path('', InspectionListCreateView.as_view(), name='list-create'),
    path('<int:pk>/', InspectionDetailView.as_view(), name='detail'),
    path('<int:pk>/images/', InspectionImageUploadView.as_view(), name='images'),
    path('<int:pk>/save/', InspectionSaveView.as_view(), name='save'),
]
