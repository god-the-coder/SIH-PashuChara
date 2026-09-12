from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase, override_settings

from . import client as ai_client
from .exceptions import AIServiceError
from .risk_engine import classify_risk, default_recommendations_for_category


@override_settings(GEMINI_KEY='test-key', GEMINI_MODEL='test-model')
class GenerateJsonTests(SimpleTestCase):
    def _mock_post(self, text, status_code=200):
        mock_response = MagicMock(status_code=status_code, ok=status_code < 400)
        mock_response.json.return_value = {
            'candidates': [{
                'content': {
                    'parts': [{'text': text}],
                },
            }],
        }
        return mock_response

    def _mock_error_post(self, status_code, message):
        mock_response = MagicMock(status_code=status_code, ok=False, text=message)
        mock_response.json.return_value = {'error': {'message': message}}
        return mock_response

    def test_raises_without_api_key(self):
        with override_settings(GEMINI_KEY=''):
            with self.assertRaises(AIServiceError):
                ai_client._generate_json(prompt='p', images=[])

    @patch('ai.client.requests.post')
    def test_generate_followup_questions_parses_list(self, mock_post):
        mock_post.return_value = self._mock_post('["Any smell?", "Any mold?"]')
        questions = ai_client.generate_followup_questions(
            inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
            storage_duration_days=10, images=[(b'fake', 'image/jpeg')],
        )
        self.assertEqual(questions, ['Any smell?', 'Any mold?'])

    @patch('ai.client.requests.post')
    def test_generate_followup_questions_rejects_non_list(self, mock_post):
        mock_post.return_value = self._mock_post('{"not": "a list"}')
        with self.assertRaises(AIServiceError):
            ai_client.generate_followup_questions(
                inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
                storage_duration_days=10, images=[(b'fake', 'image/jpeg')],
            )

    @patch('ai.client.requests.post')
    def test_analyze_material_rejects_missing_keys(self, mock_post):
        mock_post.return_value = self._mock_post('{"summary": "ok"}')
        with self.assertRaises(AIServiceError):
            ai_client.analyze_material(
                inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
                storage_duration_days=10, followup_qa=[], images=[(b'fake', 'image/jpeg')],
            )

    @patch('ai.client.requests.post')
    def test_analyze_material_parses_valid_response(self, mock_post):
        mock_post.return_value = self._mock_post(
            '{"summary": "ok", "headline": "fine", "confidence": 80, "indicators": []}',
        )
        data = ai_client.analyze_material(
            inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
            storage_duration_days=10, followup_qa=[], images=[(b'fake', 'image/jpeg')],
        )
        self.assertEqual(data['headline'], 'fine')

    @patch('ai.client.requests.post')
    def test_analyze_material_strips_markdown_json_fence(self, mock_post):
        mock_post.return_value = self._mock_post(
            '```json\n{"summary": "ok", "headline": "fine", "confidence": 80, "indicators": []}\n```',
        )
        data = ai_client.analyze_material(
            inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
            storage_duration_days=10, followup_qa=[], images=[(b'fake', 'image/jpeg')],
        )
        self.assertEqual(data['headline'], 'fine')

    @patch('ai.client.requests.post')
    def test_generate_followup_questions_ignores_trailing_chatter(self, mock_post):
        mock_post.return_value = self._mock_post(
            '["Any smell?", "Any mold?"]\n\nHope this helps!',
        )
        questions = ai_client.generate_followup_questions(
            inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
            storage_duration_days=10, images=[(b'fake', 'image/jpeg')],
        )
        self.assertEqual(questions, ['Any smell?', 'Any mold?'])

    @patch('ai.client.requests.post')
    def test_invalid_json_raises_ai_service_error(self, mock_post):
        mock_post.return_value = self._mock_post('not json')
        with self.assertRaises(AIServiceError):
            ai_client.generate_followup_questions(
                inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
                storage_duration_days=10, images=[(b'fake', 'image/jpeg')],
            )

    @patch('ai.client.requests.post')
    def test_provider_exception_wrapped_as_ai_service_error(self, mock_post):
        import requests
        mock_post.side_effect = requests.ConnectionError('network down')
        with self.assertRaises(AIServiceError):
            ai_client.generate_followup_questions(
                inspection_type='SILAGE', material_type='SILAGE', material_type_other='',
                storage_duration_days=10, images=[(b'fake', 'image/jpeg')],
            )


class ClassifyRiskTests(SimpleTestCase):
    def test_low_confidence_is_always_uncertain(self):
        result = classify_risk({'confidence': 20, 'indicators': [{'severity': 'severe'}]})
        self.assertEqual(result['risk_category'], 'UNCERTAIN')
        self.assertTrue(result['requires_lab_testing'])

    def test_severe_indicator_is_high(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'severe'}]})
        self.assertEqual(result['risk_category'], 'HIGH')
        self.assertEqual(result['risk_score'], 90)
        self.assertTrue(result['requires_lab_testing'])

    def test_moderate_indicator_is_caution(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'moderate'}]})
        self.assertEqual(result['risk_category'], 'CAUTION')
        self.assertEqual(result['risk_score'], 55)

    def test_mild_or_no_indicators_is_low(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'mild'}]})
        self.assertEqual(result['risk_category'], 'LOW')
        self.assertFalse(result['requires_lab_testing'])

    def test_no_indicators_is_low(self):
        result = classify_risk({'confidence': 95, 'indicators': []})
        self.assertEqual(result['risk_category'], 'LOW')
        self.assertEqual(result['risk_score'], 0)

    def test_verify_only_indicator_forces_lab_testing_without_driving_score(self):
        result = classify_risk({
            'confidence': 90,
            'indicators': [{'severity': 'severe', 'verify_only': True}],
        })
        self.assertEqual(result['risk_category'], 'LOW')
        self.assertTrue(result['requires_lab_testing'])

    def test_worsening_trend_escalates_one_level(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'mild'}]}, history=[10])
        self.assertEqual(result['risk_category'], 'CAUTION')
        self.assertTrue(result['trend_escalated'])

    def test_high_is_not_escalated_further(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'severe'}]}, history=[50])
        self.assertEqual(result['risk_category'], 'HIGH')
        self.assertFalse(result['trend_escalated'])

    def test_improving_trend_does_not_escalate(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'mild'}]}, history=[80])
        self.assertEqual(result['risk_category'], 'LOW')
        self.assertFalse(result['trend_escalated'])

    def test_no_history_does_not_escalate(self):
        result = classify_risk({'confidence': 90, 'indicators': [{'severity': 'mild'}]}, history=[])
        self.assertEqual(result['risk_category'], 'LOW')
        self.assertFalse(result['trend_escalated'])

    def test_uncertain_unaffected_by_history(self):
        result = classify_risk({'confidence': 20, 'indicators': [{'severity': 'severe'}]}, history=[10])
        self.assertEqual(result['risk_category'], 'UNCERTAIN')
        self.assertFalse(result['trend_escalated'])

    def test_action_label_matches_category(self):
        self.assertEqual(classify_risk({'confidence': 90, 'indicators': []})['action_label'], 'Good practices')
        self.assertEqual(
            classify_risk({'confidence': 90, 'indicators': [{'severity': 'severe'}]})['action_label'],
            'Do not feed',
        )


class DefaultRecommendationsTests(SimpleTestCase):
    def test_each_category_has_recommendations(self):
        for category in ('LOW', 'CAUTION', 'HIGH', 'UNCERTAIN'):
            recs = default_recommendations_for_category(category)
            self.assertTrue(recs)
            for rec in recs:
                self.assertIn('text', rec)
                self.assertIn('action_type', rec)
                self.assertIn('urgency', rec)

    def test_returns_a_copy_not_shared_reference(self):
        first = default_recommendations_for_category('LOW')
        first.append({'text': 'mutated', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'})
        second = default_recommendations_for_category('LOW')
        self.assertNotIn({'text': 'mutated', 'action_type': 'GENERAL', 'urgency': 'CORRECTIVE'}, second)
