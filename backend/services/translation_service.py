import asyncio
import logging

try:
    from googletrans import Translator
except ImportError:
    Translator = None

from .exceptions import TranslationServiceError

logger = logging.getLogger(__name__)


class TranslationService:
    """Isolated wrapper around googletrans for farmer-facing text.

    Two directions:
    - translate_text / translate_fields / translate_list: backend (English) ->
      farmer's chosen language, for outgoing AI explanations, recommendations,
      notifications, and voice instructions.
    - translate_to_english: farmer's free-text input (e.g. a typed observation)
      -> English, for the backend to process.

    Structured values — enums like risk_category, booleans, numbers, action/
    status codes — must never pass through here. translate_fields/translate_list
    enforce that by only touching the field names a caller explicitly lists;
    every other key on the object is passed through untouched. Any provider
    failure is caught and the original text is returned rather than raised,
    since translation is an enhancement, not something that should ever block
    a farmer from seeing their result.
    """

    SUPPORTED_LANGUAGES = {'en', 'hi', 'gu', 'kn', 'pa', 'mr', 'ta'}  # English, Hindi, Gujarati, Kannada, Punjabi, Marathi, Tamil
    DEFAULT_LANGUAGE = 'en'

    def __init__(self, translator=None):
        if translator is not None:
            self._translator = translator
        elif Translator is not None:
            self._translator = Translator()
        else:
            self._translator = None

    def is_supported(self, language_code):
        return language_code in self.SUPPORTED_LANGUAGES

    def _run_translation(self, text, *, src, dest):
        if self._translator is None:
            raise TranslationServiceError('Translation provider is not installed or available.')

        try:
            from googletrans import Translator
            translator = Translator()
            call_res = translator.translate(text, src=src, dest=dest)
            if asyncio.iscoroutine(call_res):
                try:
                    loop = asyncio.get_running_loop()
                except RuntimeError:
                    loop = None

                if loop and loop.is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as pool:
                        res = pool.submit(asyncio.run, call_res).result()
                else:
                    res = asyncio.run(call_res)
            else:
                res = call_res

            return getattr(res, 'text', str(res))
        except Exception as exc:
            raise TranslationServiceError(f'Translation failed ({src} -> {dest}): {exc}') from exc

    def translate_text(self, text, target_language, source_language='en'):
        """Translate one free-text string into target_language. Returns the
        original text unchanged if translation isn't applicable or fails."""
        if not text or not isinstance(text, str):
            return text
        if target_language == source_language or not self.is_supported(target_language):
            return text

        try:
            return self._run_translation(text, src=source_language, dest=target_language)
        except TranslationServiceError:
            logger.warning(
                'translate_text failed (%s -> %s); falling back to original text.',
                source_language, target_language, exc_info=True,
            )
            return text

    def translate_to_english(self, text, source_language=None):
        """Translate incoming farmer free text into English. No-ops if the text
        is already English (or the source language isn't one we support), and
        falls back to the original text unchanged if the provider call fails."""
        if not text or not isinstance(text, str):
            return text
        if source_language == self.DEFAULT_LANGUAGE:
            return text
        if source_language and not self.is_supported(source_language):
            return text

        try:
            return self._run_translation(text, src=source_language or 'auto', dest=self.DEFAULT_LANGUAGE)
        except TranslationServiceError:
            logger.warning('translate_to_english failed; falling back to original text.', exc_info=True)
            return text

    def translate_fields(self, data, fields, target_language, source_language='en'):
        """Translate only the named free-text `fields` of dict `data` into
        target_language. Every other key — structured values such as enums,
        booleans, numbers, codes — is copied through untouched. Returns a new
        dict; never mutates the input."""
        translated = dict(data)
        if target_language == source_language or not self.is_supported(target_language):
            return translated

        for field in fields:
            value = translated.get(field)
            if isinstance(value, str) and value:
                translated[field] = self.translate_text(value, target_language, source_language=source_language)
            elif isinstance(value, list):
                translated[field] = [
                    self.translate_text(item, target_language, source_language=source_language)
                    if isinstance(item, str) and item else item
                    for item in value
                ]
        return translated

    def translate_list(self, items, field, target_language, source_language='en'):
        """Translate one free-text `field` across a list of dicts (e.g.
        recommendations translating `text`, indicators translating
        `description`). Returns a new list of new dicts."""
        return [
            self.translate_fields(item, [field], target_language, source_language=source_language)
            for item in items
        ]
