from django.urls import path

from .views import MyFarmView, WeatherCurrentView

app_name = 'farms'

urlpatterns = [
    path('me/', MyFarmView.as_view(), name='me'),
    path('weather/', WeatherCurrentView.as_view(), name='weather'),
]
