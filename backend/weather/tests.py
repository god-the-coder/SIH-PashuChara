from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase, override_settings

from .client import fetch_current_weather
from .exceptions import WeatherServiceError


@override_settings(OPENWEATHER_KEY='test-key')
class FetchCurrentWeatherTests(SimpleTestCase):
    def test_raises_without_api_key(self):
        with override_settings(OPENWEATHER_KEY=''):
            with self.assertRaises(WeatherServiceError):
                fetch_current_weather(latitude=1, longitude=1)

    @patch('weather.client.requests.get')
    def test_parses_temperature_and_humidity(self, mock_get):
        mock_get.return_value = MagicMock(
            json=lambda: {'main': {'temp': 26.5, 'humidity': 70}},
        )
        result = fetch_current_weather(latitude=19.9975, longitude=73.7898)
        self.assertEqual(result, {'temperature_celsius': 26.5, 'humidity_percent': 70, 'condition': ''})

    @patch('weather.client.requests.get')
    def test_parses_condition_when_present(self, mock_get):
        mock_get.return_value = MagicMock(
            json=lambda: {'main': {'temp': 26.5, 'humidity': 70}, 'weather': [{'main': 'Clouds'}]},
        )
        result = fetch_current_weather(latitude=19.9975, longitude=73.7898)
        self.assertEqual(result['condition'], 'Clouds')

    @patch('weather.client.requests.get')
    def test_missing_fields_raises_service_error(self, mock_get):
        mock_get.return_value = MagicMock(json=lambda: {'main': {}})
        with self.assertRaises(WeatherServiceError):
            fetch_current_weather(latitude=19.9975, longitude=73.7898)

    @patch('weather.client.requests.get')
    def test_http_error_does_not_leak_key_in_message(self, mock_get):
        import requests

        response = MagicMock(status_code=401)
        error = requests.exceptions.HTTPError('401 for url with appid=test-key', response=response)
        mock_get.return_value.raise_for_status.side_effect = error

        with self.assertRaises(WeatherServiceError) as ctx:
            fetch_current_weather(latitude=19.9975, longitude=73.7898)

        self.assertNotIn('test-key', str(ctx.exception))
        self.assertIn('401', str(ctx.exception))

    @patch('weather.client.requests.get')
    def test_invalid_json_raises_service_error(self, mock_get):
        mock_get.return_value = MagicMock(json=lambda: (_ for _ in ()).throw(ValueError('bad json')))
        with self.assertRaises(WeatherServiceError):
            fetch_current_weather(latitude=19.9975, longitude=73.7898)
