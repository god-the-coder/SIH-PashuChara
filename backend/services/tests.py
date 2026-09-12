from types import SimpleNamespace
from unittest.mock import AsyncMock

from django.test import SimpleTestCase

from .translation_service import TranslationService


def _translated(text):
    return SimpleNamespace(text=text)


class IsSupportedTests(SimpleTestCase):
    def test_all_five_supported_languages(self):
        service = TranslationService(translator=AsyncMock())
        for code in ('en', 'hi', 'gu', 'kn', 'pa'):
            self.assertTrue(service.is_supported(code))

    def test_unsupported_language(self):
        service = TranslationService(translator=AsyncMock())
        self.assertFalse(service.is_supported('fr'))


class TranslateTextTests(SimpleTestCase):
    def test_translates_via_provider(self):
        mock_translator = AsyncMock()
        mock_translator.translate.return_value = _translated('नमस्ते')
        service = TranslationService(translator=mock_translator)

        result = service.translate_text('hello', 'hi', source_language='en')

        self.assertEqual(result, 'नमस्ते')
        mock_translator.translate.assert_awaited_once_with('hello', src='en', dest='hi')

    def test_noop_when_target_equals_source(self):
        mock_translator = AsyncMock()
        service = TranslationService(translator=mock_translator)

        result = service.translate_text('hello', 'en', source_language='en')

        self.assertEqual(result, 'hello')
        mock_translator.translate.assert_not_called()

    def test_noop_when_target_language_unsupported(self):
        mock_translator = AsyncMock()
        service = TranslationService(translator=mock_translator)

        result = service.translate_text('hello', 'fr', source_language='en')

        self.assertEqual(result, 'hello')
        mock_translator.translate.assert_not_called()

    def test_falls_back_to_original_text_on_provider_failure(self):
        mock_translator = AsyncMock()
        mock_translator.translate.side_effect = Exception('network down')
        service = TranslationService(translator=mock_translator)

        result = service.translate_text('hello', 'hi', source_language='en')

        self.assertEqual(result, 'hello')

    def test_noop_for_empty_text(self):
        service = TranslationService(translator=AsyncMock())
        self.assertEqual(service.translate_text('', 'hi'), '')
        self.assertIsNone(service.translate_text(None, 'hi'))


class TranslateToEnglishTests(SimpleTestCase):
    def test_translates_via_provider(self):
        mock_translator = AsyncMock()
        mock_translator.translate.return_value = _translated('the silage smells sour')
        service = TranslationService(translator=mock_translator)

        result = service.translate_to_english('साइलेज़ से खट्टी गंध आ रही है', source_language='hi')

        self.assertEqual(result, 'the silage smells sour')
        mock_translator.translate.assert_awaited_once_with(
            'साइलेज़ से खट्टी गंध आ रही है', src='hi', dest='en',
        )

    def test_noop_when_already_english(self):
        mock_translator = AsyncMock()
        service = TranslationService(translator=mock_translator)

        result = service.translate_to_english('already english', source_language='en')

        self.assertEqual(result, 'already english')
        mock_translator.translate.assert_not_called()

    def test_falls_back_to_original_text_on_provider_failure(self):
        mock_translator = AsyncMock()
        mock_translator.translate.side_effect = Exception('quota exceeded')
        service = TranslationService(translator=mock_translator)

        result = service.translate_to_english('कुछ पाठ', source_language='hi')

        self.assertEqual(result, 'कुछ पाठ')


class TranslateFieldsTests(SimpleTestCase):
    def test_only_translates_named_fields(self):
        mock_translator = AsyncMock()
        mock_translator.translate.return_value = _translated('अनुवादित सारांश')
        service = TranslationService(translator=mock_translator)

        data = {
            'summary': 'Mold detected on the surface',
            'risk_category': 'HIGH',
            'confidence': 88,
            'requires_lab_testing': True,
        }

        result = service.translate_fields(data, ['summary'], 'hi', source_language='en')

        self.assertEqual(result['summary'], 'अनुवादित सारांश')
        self.assertEqual(result['risk_category'], 'HIGH')
        self.assertEqual(result['confidence'], 88)
        self.assertIs(result['requires_lab_testing'], True)
        mock_translator.translate.assert_awaited_once_with('Mold detected on the surface', src='en', dest='hi')

    def test_does_not_mutate_input_dict(self):
        mock_translator = AsyncMock()
        mock_translator.translate.return_value = _translated('translated')
        service = TranslationService(translator=mock_translator)

        data = {'summary': 'original'}
        service.translate_fields(data, ['summary'], 'hi')

        self.assertEqual(data['summary'], 'original')

    def test_noop_when_target_language_unsupported(self):
        mock_translator = AsyncMock()
        service = TranslationService(translator=mock_translator)

        data = {'summary': 'text', 'risk_category': 'LOW'}
        result = service.translate_fields(data, ['summary'], 'fr')

        self.assertEqual(result, data)
        mock_translator.translate.assert_not_called()

    def test_translates_list_of_strings_field(self):
        mock_translator = AsyncMock()
        mock_translator.translate.side_effect = [_translated('एक'), _translated('दो')]
        service = TranslationService(translator=mock_translator)

        data = {'notes': ['one', 'two'], 'risk_score': 42}
        result = service.translate_fields(data, ['notes'], 'hi')

        self.assertEqual(result['notes'], ['एक', 'दो'])
        self.assertEqual(result['risk_score'], 42)


class TranslateListTests(SimpleTestCase):
    def test_translates_field_across_items(self):
        mock_translator = AsyncMock()
        mock_translator.translate.side_effect = [_translated('सिफारिश एक'), _translated('सिफारिश दो')]
        service = TranslationService(translator=mock_translator)

        items = [
            {'text': 'Do not feed the affected batch.', 'urgency': 'IMMEDIATE'},
            {'text': 'Improve storage sealing.', 'urgency': 'CORRECTIVE'},
        ]

        result = service.translate_list(items, 'text', 'hi')

        self.assertEqual(result[0]['text'], 'सिफारिश एक')
        self.assertEqual(result[0]['urgency'], 'IMMEDIATE')
        self.assertEqual(result[1]['text'], 'सिफारिश दो')
        self.assertEqual(result[1]['urgency'], 'CORRECTIVE')
        # Original items must be untouched.
        self.assertEqual(items[0]['text'], 'Do not feed the affected batch.')
