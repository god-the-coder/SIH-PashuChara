class TranslationServiceError(Exception):
    """Raised internally when the translation provider call fails. Public
    TranslationService methods never let this escape — they catch it and fall
    back to the original, untranslated text instead."""
