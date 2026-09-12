import base64
import concurrent.futures
import json
import logging
import re

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

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


MODEL_ALIASES = {
    'gemini-3.5-flash': 'gemini-3.5-flash',
    'gemini 3.5 flash': 'gemini-3.5-flash',
    'gemini-3.5-flash-lite': 'gemini-3.5-flash-lite',
    'gemini 3.5 flash lite': 'gemini-3.5-flash-lite',
    'gemini-3.1-pro': 'gemini-3.1-pro-preview',
    'gemini 3.1 pro': 'gemini-3.1-pro-preview',
    'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
    'gemini 3.1 flash lite': 'gemini-3.1-flash-lite',
    'gemini-3-flash': 'gemini-3-flash-preview',
    'gemini 3 flash': 'gemini-3-flash-preview',
    'gemini-3.8-flash': 'gemini-3.8-flash',
    'gemini 3.8 flash': 'gemini-3.8-flash',
    'gemini-3.7-flash': 'gemini-3.7-flash',
    'gemini 3.7 flash': 'gemini-3.7-flash',
    'gemini-3.6-flash': 'gemini-3.6-flash',
    'gemini 3.6 flash': 'gemini-3.6-flash',
}

DEFAULT_FREE_MODELS = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.1-pro-preview',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-flash-lite-latest',
]


def _get_api_keys_pool():
    # If GEMINI_KEY is falsy (e.g. override_settings(GEMINI_KEY='')), honor it directly
    gemini_key = getattr(settings, 'GEMINI_KEY', None)
    if not gemini_key:
        return []

    keys = getattr(settings, 'GEMINI_KEYS', None)
    if keys and isinstance(keys, list) and len(keys) > 0:
        return [k for k in keys if k]
    return [gemini_key]


def _generate_json(*, prompt, images, api_key=None):
    pool = _get_api_keys_pool()
    if not api_key and not pool:
        raise AIServiceError('GEMINI_KEY is not configured.')

    # Use provided key or primary from pool
    keys_to_try = [api_key] if api_key else list(pool)
    for k in pool:
        if k not in keys_to_try:
            keys_to_try.append(k)

    raw_model = getattr(settings, 'GEMINI_MODEL', 'gemini-3.5-flash')
    normalized = MODEL_ALIASES.get(str(raw_model).strip().lower(), str(raw_model).strip())
    models_to_try = [normalized]
    for m in DEFAULT_FREE_MODELS:
        if m not in models_to_try:
            models_to_try.append(m)

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
    # Key rotation x Model fallback
    for current_key in keys_to_try:
        for model in models_to_try:
            url = GEMINI_API_URL_TEMPLATE.format(model=model)
            try:
                response = requests.post(
                    url,
                    headers={
                        'x-goog-api-key': current_key,
                        'Content-Type': 'application/json',
                    },
                    json=payload,
                    timeout=25,
                )
            except requests.RequestException as exc:
                last_error_detail = str(exc)
                continue

            if not response.ok:
                try:
                    detail = response.json().get('error', {}).get('message', response.text)
                except Exception:
                    detail = response.text
                last_error_detail = f'{response.status_code} {detail}'
                # 503 = overloaded, 502/500 = transient, 429 = quota limit, 404 = model rename
                if response.status_code in (503, 502, 500, 429, 404):
                    continue
                # Other error on this key, try next key
                break

            try:
                body = response.json()
                candidates = body.get('candidates', [])
                if not candidates:
                    continue
                parts = candidates[0].get('content', {}).get('parts', [])
                text = ''.join(part.get('text', '') for part in parts if 'text' in part)
            except Exception as exc:
                last_error_detail = str(exc)
                continue

            if text:
                return _parse_json(text)

    raise AIServiceError(f'Gemini request failed: {last_error_detail}')


def generate_followup_questions(
    *, inspection_type, material_type, material_type_other, storage_duration_days, images, language='en',
):
    prompt = build_followup_questions_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
        language=language,
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


def _merge_indicator(existing, new_item):
    severity_rank = {'none': 0, 'mild': 1, 'moderate': 2, 'severe': 3}
    curr_sev = existing.get('severity', 'none')
    new_sev = new_item.get('severity', 'none')
    if severity_rank.get(new_sev, 0) > severity_rank.get(curr_sev, 0):
        existing['severity'] = new_sev
        existing['description'] = new_item.get('description', existing.get('description', ''))
    if new_item.get('verify_only'):
        existing['verify_only'] = True


def _synchronize_shard_results(results):
    """Consolidates findings from parallel image shards into a single authoritative report."""
    valid_results = [r for r in results if isinstance(r, dict) and 'indicators' in r]
    if not valid_results:
        raise AIServiceError('No valid analysis results returned from worker shards.')

    # If only 1 result returned, use as base
    if len(valid_results) == 1:
        return valid_results[0]

    # Combine indicators across all photo perspectives
    indicators_map = {}
    for res in valid_results:
        for ind in res.get('indicators', []):
            name = ind.get('name', '').strip().lower()
            if not name:
                continue
            if name not in indicators_map:
                indicators_map[name] = dict(ind)
            else:
                _merge_indicator(indicators_map[name], ind)

    # Average confidence across valid worker shards
    confidences = [r.get('confidence') for r in valid_results if isinstance(r.get('confidence'), (int, float))]
    avg_confidence = round(sum(confidences) / len(confidences)) if confidences else 85

    # Pick the most critical headline
    severest_headline = valid_results[0].get('headline', 'Analysis Complete')
    for res in valid_results:
        hl = res.get('headline', '')
        if any(w in hl.lower() for w in ('spoil', 'mold', 'mould', 'danger', 'severe', 'reject', 'rot')):
            severest_headline = hl
            break

    # Synthesize comprehensive summary from the views
    summaries = [r.get('summary', '').strip() for r in valid_results if r.get('summary')]
    combined_summary = ' '.join(summaries[:2]) if summaries else 'Fodder inspection analyzed across multiple camera angles.'

    # Synchronize nutritional estimates
    nutrition = None
    for res in valid_results:
        if res.get('nutritional_estimate'):
            nutrition = res['nutritional_estimate']
            break

    requires_lab = any(res.get('requires_lab_testing', False) for res in valid_results)

    return {
        'summary': combined_summary,
        'headline': severest_headline,
        'confidence': avg_confidence,
        'indicators': list(indicators_map.values()),
        'nutritional_estimate': nutrition,
        'requires_lab_testing': requires_lab,
    }



def analyze_material(
    *, inspection_type, material_type, material_type_other, storage_duration_days, followup_qa, images,
    storage_condition=None, moisture_exposure=None, farmer_observation=None,
    temperature_celsius=None, humidity_percent=None, primary_image_count=None,
):
    if not images:
        raise AIServiceError('At least one image is required for analysis.')

    prompt = build_analysis_prompt(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
        followup_qa=followup_qa, storage_condition=storage_condition, moisture_exposure=moisture_exposure,
        farmer_observation=farmer_observation, temperature_celsius=temperature_celsius,
        humidity_percent=humidity_percent, primary_image_count=primary_image_count, total_image_count=len(images),
    )

    keys_pool = _get_api_keys_pool()

    # If single image or only 1 key available, execute standard request
    if len(images) <= 1 or len(keys_pool) <= 1:
        data = _generate_json(prompt=prompt, images=images)
        if not isinstance(data, dict):
            raise AIServiceError('Expected a JSON object for the analysis result.')
        required_keys = {'summary', 'headline', 'confidence', 'indicators'}
        if not required_keys.issubset(data.keys()):
            raise AIServiceError(f'Analysis response missing required keys: {required_keys - data.keys()}')
        return data

    # Parallel Computing: Shard photos across distinct API keys concurrently
    def _analyze_shard(idx, img_tuple):
        key = keys_pool[idx % len(keys_pool)]
        masked_key = f"{key[:8]}...{key[-4:]}"
        logger.info(f"[Parallel AI Worker {idx+1}] Processing photo {idx+1}/{len(images)} on Key: {masked_key}")
        try:
            res = _generate_json(prompt=prompt, images=[img_tuple], api_key=key)
            logger.info(f"[Parallel AI Worker {idx+1}] Shard {idx+1} successfully completed on Key: {masked_key}")
            return res
        except Exception as e:
            logger.warning(f"[Parallel AI Worker {idx+1}] Key {masked_key} failed: {e}. Retrying with pool...")
            return _generate_json(prompt=prompt, images=[img_tuple])

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(images), 4)) as executor:
        futures = [executor.submit(_analyze_shard, idx, img) for idx, img in enumerate(images)]
        shard_results = []
        for f in concurrent.futures.as_completed(futures):
            try:
                res = f.result()
                if isinstance(res, dict) and 'indicators' in res:
                    shard_results.append(res)
            except Exception:
                pass

    if not shard_results:
        # If all worker threads failed, fallback to sequential all-images pass
        return _generate_json(prompt=prompt, images=images)

    return _synchronize_shard_results(shard_results)
