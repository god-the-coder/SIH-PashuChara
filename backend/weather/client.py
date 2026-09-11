import requests
from django.conf import settings

from .exceptions import WeatherServiceError

_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
_TIMEOUT_SECONDS = 10


def fetch_current_weather(*, latitude, longitude):
    if not settings.OPENWEATHER_KEY:
        raise WeatherServiceError('OPENWEATHER_KEY is not configured.')

    try:
        response = requests.get(
            _BASE_URL,
            params={
                'lat': latitude,
                'lon': longitude,
                'appid': settings.OPENWEATHER_KEY,
                'units': 'metric',
            },
            timeout=_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        # Never interpolate `exc` directly: requests embeds the full request URL
        # (including the appid API key query param) in its exception messages.
        status_code = getattr(exc.response, 'status_code', None)
        raise WeatherServiceError(f'Weather request failed (status={status_code}): {type(exc).__name__}') from None
    except ValueError as exc:
        raise WeatherServiceError(f'Weather provider returned invalid JSON: {type(exc).__name__}') from None

    main = data.get('main') or {}
    if 'temp' not in main or 'humidity' not in main:
        raise WeatherServiceError('Weather response missing temperature/humidity.')

    return {
        'temperature_celsius': main['temp'],
        'humidity_percent': main['humidity'],
    }
