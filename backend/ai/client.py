import json

from django.conf import settings
from google import genai
from google.genai import types

from .exceptions import AIServiceError
from .prompts import build_analysis_prompt, build_followup_questions_prompt

_client = None


def _get_client():
    global _client
    if _client is None:
        if not settings.GEMINI_KEY:
            raise AIServiceError('GEMINI_KEY is not configured.')
        _client = genai.Client(api_key=settings.GEMINI_KEY)
    return _client


def _image_parts(images):
    return [types.Part.from_bytes(data=data, mime_type=mime_type) for data, mime_type in images]


def _generate_json(*, prompt, images):
    client = _get_client()
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt, *_image_parts(images)],
            config=types.GenerateContentConfig(response_mime_type='application/json'),
        )
    except Exception as exc:
        raise AIServiceError(f'Gemini request failed: {exc}') from exc

    if not response.text:
        raise AIServiceError('Gemini returned an empty response.')

    try:
        return json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise AIServiceError(f'Gemini returned invalid JSON: {exc}') from exc


def generate_followup_questions(
    *, inspection_type, material_type, material_type_other, storage_duration_days, images,
):
    prompt = build_followup_questions_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
    )
    data = _generate_json(prompt=prompt, images=images)

    if not isinstance(data, list) or not all(isinstance(item, str) for item in data):
        raise AIServiceError('Expected a JSON array of question strings.')

    return data


def analyze_material(
    *, inspection_type, material_type, material_type_other, storage_duration_days, followup_qa, images,
    storage_condition=None, moisture_exposure=None, farmer_observation=None,
    temperature_celsius=None, humidity_percent=None,
):
    prompt = build_analysis_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
        followup_qa=followup_qa, storage_condition=storage_condition, moisture_exposure=moisture_exposure,
        farmer_observation=farmer_observation, temperature_celsius=temperature_celsius,
        humidity_percent=humidity_percent,
    )
    data = _generate_json(prompt=prompt, images=images)

    if not isinstance(data, dict):
        raise AIServiceError('Expected a JSON object for the analysis result.')

    required_keys = {'summary', 'headline', 'confidence', 'indicators'}
    if not required_keys.issubset(data.keys()):
        raise AIServiceError(f'Analysis response missing required keys: {required_keys - data.keys()}')

    return data
