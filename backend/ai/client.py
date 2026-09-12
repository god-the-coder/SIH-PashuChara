import base64
import json
import re

import requests
from django.conf import settings

from .exceptions import AIServiceError
from .prompts import build_analysis_prompt, build_followup_questions_prompt

GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions'

# Groq's Qwen models are reasoning models by default and burn their whole output
# budget on a <think> block before ever emitting an answer unless this is set.
_REASONING_EFFORT = 'none'

_JSON_FENCE_RE = re.compile(r'^```(?:json)?\s*|\s*```$', re.IGNORECASE | re.MULTILINE)

# Groq's vision endpoint hard-caps every model at 3 images per request,
# regardless of model — confirmed via a live 400 ("This model supports up to
# 3 images") against inspections with 4 uploaded photos (front/side/macro/storage).
_MAX_IMAGES = 3


def _cap_images(images, primary_count=None):
    """Trims to Groq's 3-image limit. When primary_count is given (the analysis
    call, where `images` is primary originals followed by their supplementary
    enhanced copies — see read_inspection_images_for_analysis), primaries are
    kept first since they're the real evidence; supplementary copies only fill
    any remaining slots. Returns (capped_images, capped_primary_count)."""
    if primary_count is None:
        return images[:_MAX_IMAGES], None

    primary = images[:primary_count][:_MAX_IMAGES]
    remaining = _MAX_IMAGES - len(primary)
    supplementary = images[primary_count:][:remaining] if remaining > 0 else []
    return primary + supplementary, len(primary)


def _image_content_parts(images):
    parts = []
    for data, mime_type in images:
        encoded = base64.b64encode(data).decode('ascii')
        parts.append({
            'type': 'image_url',
            'image_url': {'url': f'data:{mime_type};base64,{encoded}'},
        })
    return parts


def _extract_json_text(text):
    return _JSON_FENCE_RE.sub('', text.strip()).strip()


def _parse_json(text):
    # Some models keep chatting after the JSON value (e.g. a trailing note) even
    # when told not to — raw_decode only consumes the first complete JSON value
    # and ignores whatever trailing text follows it, instead of requiring the
    # whole string to be exactly one value the way json.loads does.
    cleaned = _extract_json_text(text)
    try:
        return json.JSONDecoder().raw_decode(cleaned)[0]
    except json.JSONDecodeError as exc:
        raise AIServiceError(f'Groq returned invalid JSON: {exc}') from exc


def _generate_json(*, prompt, images, max_tokens, expect_object):
    if not settings.GROQ_KEY:
        raise AIServiceError('GROQ_KEY is not configured.')

    payload = {
        'model': settings.GROQ_MODEL,
        'max_tokens': max_tokens,
        'reasoning_effort': _REASONING_EFFORT,
        'messages': [
            {
                'role': 'user',
                'content': [{'type': 'text', 'text': prompt}, *_image_content_parts(images)],
            },
        ],
    }
    # response_format=json_object only accepts a top-level JSON *object* — the
    # follow-up-questions call expects a top-level array, so it can't use this.
    if expect_object:
        payload['response_format'] = {'type': 'json_object'}

    try:
        response = requests.post(
            GROQ_CHAT_COMPLETIONS_URL,
            headers={
                'Authorization': f'Bearer {settings.GROQ_KEY}',
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=60,
        )
    except requests.RequestException as exc:
        raise AIServiceError(f'Groq request failed: {exc}') from exc

    if not response.ok:
        try:
            detail = response.json()['error']['message']
        except Exception:
            detail = response.text
        raise AIServiceError(f'Groq request failed: {response.status_code} {detail}')

    try:
        body = response.json()
        text = body['choices'][0]['message']['content']
    except Exception as exc:
        raise AIServiceError(f'Groq returned an unexpected response shape: {exc}') from exc

    if not text:
        raise AIServiceError('Groq returned an empty response.')

    return _parse_json(text)


def generate_followup_questions(
    *, inspection_type, material_type, material_type_other, storage_duration_days, images,
):
    images, _ = _cap_images(images)
    prompt = build_followup_questions_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
    )
    data = _generate_json(prompt=prompt, images=images, max_tokens=400, expect_object=False)

    if not isinstance(data, list) or not all(isinstance(item, str) for item in data):
        raise AIServiceError('Expected a JSON array of question strings.')

    return data


def analyze_material(
    *, inspection_type, material_type, material_type_other, storage_duration_days, followup_qa, images,
    storage_condition=None, moisture_exposure=None, farmer_observation=None,
    temperature_celsius=None, humidity_percent=None, primary_image_count=None,
):
    images, primary_image_count = _cap_images(images, primary_count=primary_image_count)
    prompt = build_analysis_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
        followup_qa=followup_qa, storage_condition=storage_condition, moisture_exposure=moisture_exposure,
        farmer_observation=farmer_observation, temperature_celsius=temperature_celsius,
        humidity_percent=humidity_percent, primary_image_count=primary_image_count, total_image_count=len(images),
    )
    # Free-tier Groq caps output at 1000 tokens/minute per model; stay under it.
    data = _generate_json(prompt=prompt, images=images, max_tokens=900, expect_object=True)

    if not isinstance(data, dict):
        raise AIServiceError('Expected a JSON object for the analysis result.')

    required_keys = {'summary', 'headline', 'confidence', 'indicators'}
    if not required_keys.issubset(data.keys()):
        raise AIServiceError(f'Analysis response missing required keys: {required_keys - data.keys()}')

    return data
