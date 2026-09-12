from django.urls import path

from .views import (
    BreedFeedingGuidanceView, CattleGroupDetailView, CattleGroupListCreateView, MyFarmView, WeatherCurrentView,
)

app_name = 'farms'

urlpatterns = [
    path('me/', MyFarmView.as_view(), name='me'),
    path('weather/', WeatherCurrentView.as_view(), name='weather'),
    path('cattle/', CattleGroupListCreateView.as_view(), name='cattle-list'),
    path('cattle/<int:group_id>/', CattleGroupDetailView.as_view(), name='cattle-detail'),
    path('cattle/feeding-guidance/', BreedFeedingGuidanceView.as_view(), name='cattle-feeding-guidance'),
]
