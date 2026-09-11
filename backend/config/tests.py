from django.test import TestCase
from django.urls import reverse
from rest_framework import status


class FoundationHealthAndDocsTests(TestCase):
    def test_health_check_endpoint(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('status'), 'healthy')
        self.assertEqual(response.data.get('database'), 'connected')

    def test_schema_endpoint(self):
        url = reverse('schema')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui_endpoint(self):
        url = reverse('swagger-ui')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_redoc_endpoint(self):
        url = reverse('redoc')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
