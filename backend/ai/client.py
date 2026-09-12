import base64
import json
import re

import requests
from django.conf import settings

from .exceptions import AIServiceError
from .prompts import (
    build_analysis_prompt, build_breed_feeding_guidance_prompt, build_capture_guidance_prompt,
    build_followup_questions_prompt,
)

GEMINI_API_URL_TEMPLATE = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'

_JSON_FENCE_RE = re.compile(r'^```(?:json)?\s*|\s*```$', re.IGNORECASE | re.MULTILINE)


def _image_parts(images):
    parts = []
    for data, mime_type in images:
        encoded = base64.b64encode(data).decode('ascii')
        parts.append({
            'inline_data': {
                'mime_type': mime_type,
                'data': encoded,
            },
        })
    return parts


def _extract_json_text(text):
    return _JSON_FENCE_RE.sub('', text.strip()).strip()


def _parse_json(text):
    cleaned = _extract_json_text(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        try:
            return json.JSONDecoder().raw_decode(cleaned)[0]
        except Exception as exc:
            raise AIServiceError(f'Gemini returned invalid JSON: {exc}') from exc


def _generate_json(*, prompt, images):
    if not getattr(settings, 'GEMINI_KEY', None):
        raise AIServiceError('GEMINI_KEY is not configured.')

    configured_model = getattr(settings, 'GEMINI_MODEL', 'gemini-3.6-flash')
    models_to_try = [configured_model]
    if configured_model == 'gemini-3.8-flash':
        models_to_try.append('gemini-3.6-flash')
    elif configured_model == 'gemini-3.6-flash':
        models_to_try.append('gemini-3.8-flash')

    payload = {
        'contents': [
            {
                'parts': [
                    {'text': prompt},
                    *_image_parts(images),
                ],
            },
        ],
        'generationConfig': {
            'responseMimeType': 'application/json',
        },
    }

    last_error_detail = None
    for model in models_to_try:
        url = GEMINI_API_URL_TEMPLATE.format(model=model)
        try:
            response = requests.post(
                url,
                headers={
                    'x-goog-api-key': settings.GEMINI_KEY,
                    'Content-Type': 'application/json',
                },
                json=payload,
                timeout=60,
            )
        except requests.RequestException as exc:
            raise AIServiceError(f'Gemini request failed: {exc}') from exc

        if not response.ok:
            try:
                detail = response.json().get('error', {}).get('message', response.text)
            except Exception:
                detail = response.text
            last_error_detail = f'{response.status_code} {detail}'
            # 503 = model overloaded, 429 = this model's free-tier quota exhausted —
            # both are worth retrying on the other model, since each has its own
            # separate free-tier quota bucket.
            if response.status_code in (503, 429) and model != models_to_try[-1]:
                continue
            raise AIServiceError(f'Gemini request failed: {last_error_detail}')

        try:
            body = response.json()
            candidates = body.get('candidates', [])
            if not candidates:
                raise AIServiceError('Gemini returned no candidates.')
            parts = candidates[0].get('content', {}).get('parts', [])
            text = ''.join(part.get('text', '') for part in parts if 'text' in part)
        except Exception as exc:
            raise AIServiceError(f'Gemini returned an unexpected response shape: {exc}') from exc

        if not text:
            raise AIServiceError('Gemini returned an empty response.')

        return _parse_json(text)

    raise AIServiceError(f'Gemini request failed: {last_error_detail}')


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


def generate_capture_guidance(*, step_label, step_description, image, language='en'):
    prompt = build_capture_guidance_prompt(
        step_label=step_label, step_description=step_description, language=language,
    )
    data = _generate_json(prompt=prompt, images=[image])

    if not isinstance(data, dict) or 'is_good' not in data or 'feedback' not in data:
        raise AIServiceError('Expected a JSON object with is_good and feedback.')

    return {'is_good': bool(data['is_good']), 'feedback': str(data['feedback'])}


def generate_breed_feeding_guidance(*, cattle_groups, language='en'):
    prompt = build_breed_feeding_guidance_prompt(cattle_groups=cattle_groups, language=language)
    data = _generate_json(prompt=prompt, images=[])

    if not isinstance(data, dict) or 'guidance' not in data:
        raise AIServiceError('Expected a JSON object with guidance.')

    return {'guidance': str(data['guidance'])}


def analyze_material(
    *, inspection_type, material_type, material_type_other, storage_duration_days, followup_qa, images,
    storage_condition=None, moisture_exposure=None, farmer_observation=None,
    temperature_celsius=None, humidity_percent=None, primary_image_count=None,
):
    prompt = build_analysis_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
        followup_qa=followup_qa, storage_condition=storage_condition, moisture_exposure=moisture_exposure,
        farmer_observation=farmer_observation, temperature_celsius=temperature_celsius,
        humidity_percent=humidity_percent, primary_image_count=primary_image_count, total_image_count=len(images),
    )
    data = _generate_json(prompt=prompt, images=images)

    if not isinstance(data, dict):
        raise AIServiceError('Expected a JSON object for the analysis result.')

    required_keys = {'summary', 'headline', 'confidence', 'indicators'}
    if not required_keys.issubset(data.keys()):
        raise AIServiceError(f'Analysis response missing required keys: {required_keys - data.keys()}')

    return data
