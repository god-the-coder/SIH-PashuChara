_GUIDANCE_LANGUAGE_NAMES = {
    'hi': 'Hindi', 'en': 'English', 'mr': 'Marathi',
    'gu': 'Gujarati', 'kn': 'Kannada', 'ta': 'Tamil',
}


def build_capture_guidance_prompt(*, step_label, step_description, language='en'):
    language_name = _GUIDANCE_LANGUAGE_NAMES.get(language, 'English')
    return (
        'You are a live camera assistant helping an Indian farmer photograph animal feed/silage for a '
        'quality inspection app. The farmer just captured the photo attached below for this step:\n\n'
        f'Step: {step_label}\n'
        f'What this photo needs to show: {step_description}\n\n'
        'Judge ONLY the photo\'s capture quality — framing, distance, lighting, focus/blur, and whether the '
        "required subject is actually visible — never the material's condition or quality (that is a separate "
        'analysis). Respond with ONLY a JSON object of this exact shape (no other text):\n'
        '{\n'
        '  "is_good": <true if this photo is usable as-is, false if the farmer should retake it>,\n'
        f'  "feedback": "one short, encouraging, actionable sentence in {language_name}, written in simple '
        'words a farmer would understand"\n'
        '}'
    )

def build_breed_feeding_guidance_prompt(*, cattle_groups, language='en'):
    language_name = _GUIDANCE_LANGUAGE_NAMES.get(language, 'English')
    groups_lines = '\n'.join(
        f'- {group["count"]}x {group["breed"]} ({group["category"]}), '
        f'{group["milk_liters_per_day"]} L/day milk yield, lactation stage: {group["lactation_stage"] or "not specified"}'
        for group in cattle_groups
    )
    return (
        'You are a livestock nutrition advisor for Indian dairy farmers using a fodder/feed quality app. '
        "The farmer has registered the following animals on their farm:\n\n"
        f'{groups_lines}\n\n'
        'Write practical, breed-specific daily feeding guidance covering silage/green fodder and concentrate '
        '(dana mixture) quantities per animal, tailored to these specific breeds, their milk yield and lactation '
        'stage. Base it on real dairy husbandry practice for these breeds in India. Keep it concrete (include kg '
        'quantities) and actionable, 2-4 sentences total, grouped by breed if there is more than one. '
        f'Respond with ONLY a JSON object of this exact shape (no other text):\n'
        '{\n'
        f'  "guidance": "the feeding guidance, written in {language_name}, in simple words a farmer would understand"\n'
        '}'
    )


def _context_block(*, inspection_type, material_type, material_type_other, storage_duration_days):
    material = material_type_other if material_type == 'OTHER' and material_type_other else material_type
    return (
        f'Material category: {inspection_type}\n'
        f'Material type: {material}\n'
        f'Storage duration: {storage_duration_days} days\n'
    )


def build_followup_questions_prompt(*, inspection_type, material_type, material_type_other, storage_duration_days, language='en'):
    language_name = _GUIDANCE_LANGUAGE_NAMES.get(language, 'English')
    context = _context_block(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
    )
    return (
        'You are assisting a farmer-facing app that visually screens animal feed and silage for quality issues. '
        'You are shown photos of the material described below.\n\n'
        f'{context}\n'
        'Based only on what is visually ambiguous or uncertain in the photos, write 2 to 4 short, plain-language '
        f'follow-up questions in {language_name} to ask the farmer that would meaningfully improve your assessment '
        '(for example, about smell, texture, or recent weather exposure). '
        'Do not ask about anything already stated above. If the photos give you enough information already, '
        'return fewer questions, even zero.\n\n'
        'Respond with ONLY a JSON array of strings, e.g. ["question one?", "question two?"]. No other text.'
    )


def build_analysis_prompt(
    *, inspection_type, material_type, material_type_other, storage_duration_days, followup_qa,
    storage_condition=None, moisture_exposure=None, farmer_observation=None,
    temperature_celsius=None, humidity_percent=None, primary_image_count=None, total_image_count=None,
):
    context = _context_block(
        inspection_type=inspection_type, material_type=material_type,
        material_type_other=material_type_other, storage_duration_days=storage_duration_days,
    )
    qa_block = ''
    if followup_qa:
        qa_lines = '\n'.join(f'Q: {item.get("question", "")}\nA: {item.get("answer", "")}' for item in followup_qa)
        qa_block = f'\nFarmer-provided answers to follow-up questions:\n{qa_lines}\n'

    extra_context_lines = []
    if storage_condition:
        extra_context_lines.append(f'Farmer-reported storage condition: {storage_condition}')
    if moisture_exposure is not None:
        extra_context_lines.append(f'Farmer-reported moisture exposure: {"Yes" if moisture_exposure else "No"}')
    if farmer_observation:
        extra_context_lines.append(f'Farmer observation: {farmer_observation}')
    if temperature_celsius is not None:
        extra_context_lines.append(f'Ambient temperature: {temperature_celsius}°C')
    if humidity_percent is not None:
        extra_context_lines.append(f'Ambient humidity: {humidity_percent}%')
    extra_context_block = ('\n'.join(extra_context_lines) + '\n') if extra_context_lines else ''

    image_role_block = ''
    if primary_image_count and total_image_count and total_image_count > primary_image_count:
        supplementary_count = total_image_count - primary_image_count
        image_role_block = (
            f'\nThe first {primary_image_count} attached image(s) are the farmer\'s original, unedited photos — '
            'treat these as the primary evidence for your assessment. '
            f'The following {supplementary_count} image(s) are automatically resized, brightness/contrast-'
            'normalized, denoised and lightly sharpened copies of those same photos, provided only to help you '
            'see faint detail (e.g. subtle mold or discoloration) more clearly. Treat them as supplementary '
            'visual aids, not as independent or primary evidence, and never cite an artifact introduced by '
            'this processing (e.g. over-sharpened edges, denoising smoothing) as a finding.\n'
        )

    return (
        'You are the visual-assessment component of a farmer-facing app that screens animal feed and silage '
        'for visible quality and safety concerns. You are NOT performing laboratory analysis, and must not '
        'claim certainty about anything that requires physical or chemical testing (nutritional composition, '
        'pH, aflatoxins, mycotoxins, urea adulteration). Frame those as reference-based estimates or flag them '
        'as requiring verification.\n\n'
        f'{context}{qa_block}{extra_context_block}{image_role_block}\n'
        'Examine the attached photos and respond with ONLY a JSON object of this exact shape (no other text):\n'
        '{\n'
        '  "summary": "1-2 plain-language sentences a farmer can understand",\n'
        '  "headline": "a very short label for the single most important finding, e.g. \'Mould detected\'",\n'
        '  "confidence": <integer 0-100, your confidence in this visual assessment>,\n'
        '  "indicators": [\n'
        '    {\n'
        '      "name": "short indicator name, e.g. \'mould\', \'discoloration\', \'foreign_material\'",\n'
        '      "category": "contamination | silage_quality | storage_environment | nutritional",\n'
        '      "severity": "none | mild | moderate | severe",\n'
        '      "verify_only": <true if this cannot be judged visually and needs lab/physical testing '
        'instead of a severity, false otherwise>,\n'
        '      "description": "one short sentence"\n'
        '    }\n'
        '  ],\n'
        '  "nutritional_estimate": {\n'
        '    "crude_protein_percent": [<low>, <high>] or null,\n'
        '    "fiber_percent": [<low>, <high>] or null,\n'
        '    "moisture_condition": "normal | concern",\n'
        '    "note": "these are approximate, reference-based estimates, not laboratory measurements"\n'
        '  },\n'
        '  "requires_lab_testing": <true if any finding cannot be confidently confirmed without lab/physical testing>\n'
        '}'
    )
