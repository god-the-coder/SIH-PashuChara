from django.urls import path

from .views import MyFarmView

app_name = 'farms'

urlpatterns = [
    path('me/', MyFarmView.as_view(), name='me'),
]
