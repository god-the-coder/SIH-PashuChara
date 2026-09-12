import json
import logging
import cv2
import numpy as np
import requests
from django.conf import settings

from .exceptions import AIServiceError

logger = logging.getLogger(__name__)

GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'

# Fast and available Groq text models for prompt-based feedback formulation
GROQ_MODELS_TO_TRY = [
    getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-20b'),
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'groq/compound-mini',
    'qwen/qwen3.6-27b',
]

_LANG_NAMES = {
    'hi': 'Hindi',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'en': 'English',
}

_AUDIO_PROMPTS = {
    'human_detected': {
        'en': 'Human or person detected in frame. Please point the camera at animal feed instead of people.',
        'hi': 'फ्रेम में इंसान या चेहरा दिख रहा है। कृपया लोगों के बजाय पशु आहार या चारे की फोटो लें।',
        'mr': 'फ्रेममध्ये व्यक्ती किंवा चेहरा दिसत आहे. कृपया माणसांऐवजी जनावरांच्या चाऱ्याचा फोटो काढा.',
        'ta': 'மனித முகம் தெரிகிறது. தயவுசெய்து மனிதர்களுக்கு பதிலாக கால்நடை தீவனத்தை படம் பிடிக்கவும்.',
        'gu': 'ફ્રેમમાં વ્યક્તિ અથવા ચહેરો દેખાય છે. કૃપા કરીને લોકોના બદલે પશુ આહારનો ફોટો લો.',
        'kn': 'ಫ್ರೇಮ್‌ನಲ್ಲಿ ಮನುಷ್ಯ ಕಾಣಿಸುತ್ತಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ಜನರ ಬದಲು ಜಾನುವಾರು ಮೇವಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
    },
    'not_feed': {
        'en': 'This does not look like animal feed. Please bring the actual cattle feed or silage into frame.',
        'hi': 'यह पशु आहार या चारा नहीं दिख रहा है। कृपया केवल सही चारे को स्क्रीन में लाएँ।',
        'mr': 'हे जनावरांचे खाद्य किंवा चारा दिसत नाही. कृपया योग्य चाऱ्याचा फोटो काढा.',
        'ta': 'இது கால்நடை தீவனம் போல் இல்லை. சரியான தீவனத்தின் புகைப்படத்தை எடுக்கவும்.',
        'gu': 'આ પશુ આહાર કે ઘાસચારો દેખાતો નથી. કૃપા કરીને સાચો ઘાસચારો ફ્રેમમાં લાવો.',
        'kn': 'ಇದು ಜಾನುವಾರು ಆಹಾರದಂತೆ ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರಿಯಾದ ಮೇವನ್ನು ತೋರಿಸಿ.',
    },
    'blurry': {
        'en': 'The camera is blurry. Please hold the device steady and tap the screen to focus.',
        'hi': 'कैमरा धुंधला दिख रहा है। कृपया फोन को स्थिर पकड़ें और फोकस करें।',
        'mr': 'कॅमेरा अस्पष्ट दिसत आहे. कृपया फोन स्थिर धरा आणि फोकस करा.',
        'ta': 'கேமரா மங்கலாக உள்ளது. தயவுசெய்து மொபைலை அசைக்காமல் நிலையாக பிடித்து எடுக்கவும்.',
        'gu': 'કેમેરો ઝાંખો છે. કૃપા કરીને ફોન સ્થિર પકડો અને ફોકસ કરો.',
        'kn': 'ಕ್ಯಾಮೆರಾ ಮಸುಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಫೋನ್ ಅನ್ನು ಸ್ಥಿರವಾಗಿ ಹಿಡಿದುಕೊಳ್ಳಿ.',
    },
    'dark': {
        'en': 'The lighting is too dark. Please move to a brighter spot or turn on the flash.',
        'hi': 'रोशनी बहुत कम और अंधेरा है। कृपया उजाले में जाएं या टॉर्च जलाएं।',
        'mr': 'प्रकाश खूप कमी आहे. कृपया अधिक प्रकाशात जा किंवा फ्लॅश चालू करा.',
        'ta': 'வெளிச்சம் மிக குறைவாக உள்ளது. வெளிச்சமுள்ள இடத்திற்கு சென்று புகைப்படம் எடுக்கவும்.',
        'gu': 'પ્રકાશ ખૂબ ઓછો છે. કૃપા કરીને અજવાળામાં જાઓ.',
        'kn': 'ಬೆಳಕು ತುಂಬಾ ಕಡಿಮೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಪ್ರಕಾಶಮಾನವಾದ ಜಾಗಕ್ಕೆ ಹೋಗಿ.',
    },
    'overexposed': {
        'en': 'The photo has too much glare. Please angle away from direct harsh light.',
        'hi': 'फोटो पर बहुत ज्यादा चमक या धूप पड़ रही है। कृपया कोण बदलकर फोटो लें।',
        'mr': 'फोटोवर खूप जास्त प्रखर प्रकाश पडत आहे. कृपया कोन बदलून फोटो घ्या.',
        'ta': 'அதிகப்படியான வெளிச்சம் விழுகிறது. சற்று கோணத்தை மாற்றி எடுக்கவும்.',
        'gu': 'ખૂબ વધારે ચમકારો છે. કૃપા કરીને ખૂણો બદલો.',
        'kn': 'ತುಂಬಾ ಪ್ರಖರ ಬೆಳಕಿದೆ. ದಯವಿಟ್ಟು ಕೋನವನ್ನು ಬದಲಾಯಿಸಿ.',
    },
    'good': {
        'en': 'Feed is clear and centered. Ready to capture!',
        'hi': 'चारा एकदम साफ और केंद्रित है। अब फोटो खींचें!',
        'mr': 'चारा अगदी स्पष्ट आणि केंद्रित आहे. आता फोटो काढा!',
        'ta': 'தீவனம் தெளிவாகவும் சரியாகவும் உள்ளது. இப்போது புகைப்படம் எடுக்கலாம்!',
        'gu': 'ઘાસચારો સ્પષ્ટ અને કેન્દ્રિત છે. હવે ફોટો લો!',
        'kn': 'ಮೇವು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಿಸುತ್ತಿದೆ. ಈಗ ಫೋಟೋ ತೆಗೆಯಿರಿ!',
    },
}


def analyze_capture_quality(image_bytes):
    """Deterministic, high-speed computer vision metrics on image bytes:
    - Laplacian variance (blur detection)
    - Mean brightness (too dark / overexposed)
    - Human presence detection (YCrCb skin tone segmentation in center and overall)
    - Plant / Feed color metrics (green, golden-yellow, straw hues typical of feed)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {
            'is_good': False,
            'issue': 'blurry',
            'blur_score': 0.0,
            'brightness': 0.0,
            'feed_color_ratio': 0.0,
            'skin_ratio': 0.0,
            'edge_density': 0.0,
        }

    # 1. Blur metric: Variance of Laplacian
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # 2. Lighting metric: Mean brightness
    brightness = float(np.mean(gray))

    # 3. Human skin detection via YCrCb color space
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    cr = ycrcb[:, :, 1]
    cb = ycrcb[:, :, 2]
    skin_mask = (cr >= 133) & (cr <= 173) & (cb >= 77) & (cb <= 127)

    h, w = img.shape[:2]
    c_y1, c_y2 = int(h * 0.15), int(h * 0.85)
    c_x1, c_x2 = int(w * 0.15), int(w * 0.85)
    center_skin = skin_mask[c_y1:c_y2, c_x1:c_x2]
    center_skin_ratio = float(np.count_nonzero(center_skin) / center_skin.size)
    overall_skin_ratio = float(np.count_nonzero(skin_mask) / skin_mask.size)

    # 4. Feed / fodder plant color representation & texture:
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h_channel = hsv[:, :, 0]
    s_channel = hsv[:, :, 1]
    v_channel = hsv[:, :, 2]

    # Plant green: authentic vegetation / fresh fodder hue (30 - 85 deg, saturation >= 45)
    green_mask = (h_channel >= 30) & (h_channel <= 85) & (s_channel >= 45) & (v_channel >= 40)
    # Straw / silage golden yellow: true dry fodder hue (14 - 28 deg, saturation >= 75)
    yellow_fodder_mask = (h_channel >= 14) & (h_channel <= 28) & (s_channel >= 75) & (v_channel >= 55)
    feed_mask = green_mask | yellow_fodder_mask
    feed_color_ratio = float(np.count_nonzero(feed_mask) / feed_mask.size)

    edges = cv2.Canny(gray, 70, 160)
    edge_density = float(np.count_nonzero(edges) / edges.size)

    # Human detection rule:
    # If skin is detected (>6% center or >4% overall), check if skin clearly outweighs feed
    is_human = (center_skin_ratio >= 0.06 or overall_skin_ratio >= 0.04) and (center_skin_ratio > feed_color_ratio or feed_color_ratio < 0.20)

    if is_human:
        issue = 'human_detected'
        is_good = False
    elif blur_score < 40.0:
        issue = 'blurry'
        is_good = False
    elif brightness < 45.0:
        issue = 'dark'
        is_good = False
    elif brightness > 225.0:
        issue = 'overexposed'
        is_good = False
    elif feed_color_ratio < 0.22:
        issue = 'not_feed'
        is_good = False
    else:
        issue = 'good'
        is_good = True

    return {
        'is_good': is_good,
        'issue': issue,
        'blur_score': blur_score,
        'brightness': brightness,
        'feed_color_ratio': feed_color_ratio,
        'skin_ratio': center_skin_ratio,
        'edge_density': edge_density,
    }


def generate_groq_guidance(*, step_label, step_description, image_bytes, language='en'):
    """Performs camera check with pure CV analysis + Groq LLM (no Gemini involved)."""
    metrics = analyze_capture_quality(image_bytes)
    issue = metrics['issue']
    is_good = metrics['is_good']

    # Baseline audio & text feedback matching user's exact language
    lang_key = language if language in _AUDIO_PROMPTS.get(issue, {}).keys() else ('hi' if language == 'hi' else 'en')
    default_audio = _AUDIO_PROMPTS.get(issue, _AUDIO_PROMPTS['good']).get(lang_key, _AUDIO_PROMPTS[issue]['en'])
    feedback_text = default_audio

    # If the frame has no issues, return immediately for instant real-time speed
    if is_good:
        return {
            'is_good': True,
            'issue': 'good',
            'feedback': default_audio,
            'audio_instruction': default_audio,
            'metrics': {
                'blur_score': round(metrics['blur_score'], 1),
                'brightness': round(metrics['brightness'], 1),
                'feed_color_ratio': round(metrics['feed_color_ratio'], 2),
                'skin_ratio': round(metrics['skin_ratio'], 2),
            },
        }

    groq_key = getattr(settings, 'GROQ_KEY', None)
    if groq_key:
        lang_name = _LANG_NAMES.get(language, 'English')
        system_prompt = (
            f"You are PashuChara camera assistant helping a farmer photograph cattle feed. "
            f"Write exactly ONE short, friendly, actionable advice sentence strictly in {lang_name}. "
            f"CRITICAL: If language is English, answer ONLY in English. Do not use Hindi unless language is Hindi. "
            "Respond ONLY with a JSON object: {\"feedback\": \"...\"}"
        )
        action_desc = (
            'Human/person detected in frame. Tell farmer to point camera at animal feed instead of people'
            if issue == 'human_detected'
            else 'Tell farmer this is not cattle feed and they must bring real cattle feed or fodder into frame'
            if issue == 'not_feed'
            else 'Hold device steady to eliminate blur'
            if issue == 'blurry'
            else 'Improve lighting'
            if issue in ('dark', 'overexposed')
            else 'Photo is good'
        )
        user_prompt = (
            f"Requested Language: {lang_name}\n"
            f"Step: {step_label} ({step_description})\n"
            f"Diagnosis: issue={issue}, blur_score={metrics['blur_score']:.1f}, "
            f"brightness={metrics['brightness']:.1f}/255, feed_color_ratio={metrics['feed_color_ratio']:.2f}, "
            f"skin_ratio={metrics.get('skin_ratio', 0.0):.2f}\n"
            f"Action needed: {action_desc}"
        )

        for model in GROQ_MODELS_TO_TRY:
            try:
                resp = requests.post(
                    GROQ_CHAT_URL,
                    headers={
                        'Authorization': f'Bearer {groq_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': model,
                        'messages': [
                            {'role': 'system', 'content': system_prompt},
                            {'role': 'user', 'content': user_prompt},
                        ],
                        'response_format': {'type': 'json_object'},
                        'temperature': 0.2,
                    },
                    timeout=5,
                )
                if resp.ok:
                    data = resp.json()
                    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                    parsed = json.loads(content)
                    if 'feedback' in parsed and parsed['feedback'].strip():
                        feedback_text = parsed['feedback'].strip()
                        break
            except Exception as e:
                logger.warning("Groq guidance call failed on model %s: %s", model, e)
                continue

    return {
        'is_good': is_good,
        'issue': issue,
        'feedback': feedback_text,
        'audio_instruction': feedback_text,
        'metrics': {
            'blur_score': round(metrics['blur_score'], 1),
            'brightness': round(metrics['brightness'], 1),
            'feed_color_ratio': round(metrics['feed_color_ratio'], 2),
        },
    }
