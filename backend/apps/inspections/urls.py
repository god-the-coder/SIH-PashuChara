from django.urls import path

from .views import (
    InspectionAnalyzeView,
    InspectionAnswerQuestionsView,
    InspectionDetailView,
    InspectionImageUploadView,
    InspectionListCreateView,
    InspectionQuestionsView,
    InspectionSaveView,
)

app_name = 'inspections'

urlpatterns = [
    path('', InspectionListCreateView.as_view(), name='list-create'),
    path('<int:pk>/', InspectionDetailView.as_view(), name='detail'),
    path('<int:pk>/images/', InspectionImageUploadView.as_view(), name='images'),
    path('<int:pk>/questions/', InspectionQuestionsView.as_view(), name='questions'),
    path('<int:pk>/questions/answer/', InspectionAnswerQuestionsView.as_view(), name='questions-answer'),
    path('<int:pk>/analyze/', InspectionAnalyzeView.as_view(), name='analyze'),
    path('<int:pk>/save/', InspectionSaveView.as_view(), name='save'),
]
