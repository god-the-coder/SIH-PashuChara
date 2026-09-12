from django.urls import path

from .views import CattleGroupDetailView, CattleGroupListCreateView, MyFarmView, WeatherCurrentView

app_name = 'farms'

urlpatterns = [
    path('me/', MyFarmView.as_view(), name='me'),
    path('weather/', WeatherCurrentView.as_view(), name='weather'),
    path('cattle/', CattleGroupListCreateView.as_view(), name='cattle-list'),
    path('cattle/<int:group_id>/', CattleGroupDetailView.as_view(), name='cattle-detail'),
]
