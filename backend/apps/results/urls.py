from django.urls import path

from .views import ResultDetailView

app_name = 'results'

urlpatterns = [
    path('<int:inspection_id>/', ResultDetailView.as_view(), name='detail'),
]
