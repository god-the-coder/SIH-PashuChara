from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.inspections.models import InspectionType, MaterialType
from apps.inspections.services import add_inspection_image, create_draft_inspection, save_inspection

from apps.batches.services import ensure_batch_for_inspection

from .models import RiskCategory
from .permissions import IsResultOwner
from .selectors import get_result_by_inspection
from .services import analyze_inspection, build_batch_trend, record_result


def make_test_image():
    import io

    from PIL import Image
    buf = io.BytesIO()
    Image.new('RGB', (10, 10), color='green').save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile('test.jpg', buf.read(), content_type='image/jpeg')


def make_saved_inspection(owner):
    inspection = create_draft_inspection(
        owner=owner, inspection_type=InspectionType.FEED,
        material_type=MaterialType.DRY_FODDER, storage_duration_days=6,
    )
    save_inspection(inspection=inspection)
    return inspection


class ResultSelectorTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876510001', full_name='Owner', password='StrongPass123',
        )
        self.inspection = make_saved_inspection(self.owner)
        self.result = record_result(inspection=self.inspection, risk_category=RiskCategory.LOW, summary='ok')

    def test_get_result_by_inspection_found_and_missing(self):
        other_inspection = make_saved_inspection(self.owner)
        self.assertEqual(get_result_by_inspection(inspection=self.inspection), self.result)
        self.assertIsNone(get_result_by_inspection(inspection=other_inspection))


class RecordResultServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876510002', full_name='Owner', password='StrongPass123',
        )

    def test_record_result_allows_draft_inspection(self):
        # Analysis happens before the farmer decides to save (architecture.txt flow).
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=3,
        )
        result = record_result(inspection=inspection, risk_category=RiskCategory.LOW, summary='ok')
        self.assertEqual(result.inspection, inspection)

    def test_record_result_creates_result_for_saved_inspection(self):
        inspection = make_saved_inspection(self.owner)
        result = record_result(
            inspection=inspection, risk_category=RiskCategory.CAUTION, summary='Some mold visible.',
            risk_score=55, headline='Mould detected', action_label='Corrective actions',
            confidence=80, findings={'mold': True}, requires_lab_testing=True,
        )
        self.assertEqual(result.inspection, inspection)
        self.assertEqual(result.risk_score, 55)
        self.assertEqual(result.headline, 'Mould detected')
        self.assertEqual(result.confidence, 80)
        self.assertTrue(result.requires_lab_testing)

    def test_record_result_rejects_duplicate(self):
        inspection = make_saved_inspection(self.owner)
        record_result(inspection=inspection, risk_category=RiskCategory.LOW, summary='ok')
        with self.assertRaises(ValidationError):
            record_result(inspection=inspection, risk_category=RiskCategory.HIGH, summary='dup')


class AnalyzeInspectionServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876510007', full_name='Owner', password='StrongPass123',
        )
        self.inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=30,
        )

    def test_analyze_inspection_requires_image(self):
        with self.assertRaises(ValidationError):
            analyze_inspection(inspection=self.inspection)

    @patch('apps.results.services.analyze_material')
    def test_analyze_inspection_creates_result_and_recommendations(self, mock_analyze):
        mock_analyze.return_value = {
            'summary': 'Some mold visible.', 'headline': 'Mould detected', 'confidence': 90,
            'indicators': [{'severity': 'severe'}], 'requires_lab_testing': False,
        }
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())

        result = analyze_inspection(inspection=self.inspection)

        self.assertEqual(result.risk_category, RiskCategory.HIGH)
        self.assertEqual(result.headline, 'Mould detected')
        self.assertTrue(result.requires_lab_testing)
        self.assertTrue(result.recommendations.exists())
        image.image.delete(save=False)

    @patch('apps.results.services.analyze_material')
    def test_analyze_inspection_passes_batch_history_to_risk_engine(self, mock_analyze):
        from apps.batches.services import ensure_batch_for_inspection

        mock_analyze.side_effect = [
            {'summary': 'ok', 'headline': 'fine', 'confidence': 90, 'indicators': [{'severity': 'none'}]},
            {'summary': 'worse', 'headline': 'mild concern', 'confidence': 90, 'indicators': [{'severity': 'mild'}]},
        ]

        first_inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )
        image1 = add_inspection_image(inspection=first_inspection, image=make_test_image())
        first_result = analyze_inspection(inspection=first_inspection)
        self.assertEqual(first_result.risk_category, RiskCategory.LOW)
        self.assertEqual(first_result.risk_score, 0)
        # Only SAVED inspections count as batch history — an analyzed-but-unsaved
        # draft must not influence a later inspection's trend escalation.
        save_inspection(inspection=first_inspection)
        batch = ensure_batch_for_inspection(inspection=first_inspection)

        second_inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=20,
        )
        second_inspection.batch = batch
        second_inspection.save(update_fields=['batch'])
        image2 = add_inspection_image(inspection=second_inspection, image=make_test_image())

        # Second inspection scores higher than the first on the same batch, so the
        # Risk Engine should escalate it one level beyond its own raw LOW threshold.
        second_result = analyze_inspection(inspection=second_inspection)
        self.assertEqual(second_result.risk_score, 25)
        self.assertEqual(second_result.risk_category, RiskCategory.CAUTION)

        image1.image.delete(save=False)
        image2.image.delete(save=False)

    @patch('apps.results.services.analyze_material')
    def test_unsaved_draft_result_excluded_from_batch_history(self, mock_analyze):
        from apps.batches.services import ensure_batch_for_inspection

        mock_analyze.side_effect = [
            {'summary': 'ok', 'headline': 'fine', 'confidence': 90, 'indicators': [{'severity': 'severe'}]},
            {'summary': 'ok', 'headline': 'fine', 'confidence': 90, 'indicators': [{'severity': 'mild'}]},
        ]

        # Analyzed but deliberately left as DRAFT (abandoned session).
        abandoned_inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )
        image1 = add_inspection_image(inspection=abandoned_inspection, image=make_test_image())
        analyze_inspection(inspection=abandoned_inspection)
        batch = ensure_batch_for_inspection(inspection=abandoned_inspection)

        second_inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=20,
        )
        second_inspection.batch = batch
        second_inspection.save(update_fields=['batch'])
        image2 = add_inspection_image(inspection=second_inspection, image=make_test_image())

        # The abandoned draft's HIGH-severity result must not escalate this one.
        second_result = analyze_inspection(inspection=second_inspection)
        self.assertEqual(second_result.risk_category, RiskCategory.LOW)

        image1.image.delete(save=False)
        image2.image.delete(save=False)

    @patch('apps.results.services.analyze_material')
    def test_analyze_inspection_rejects_duplicate(self, mock_analyze):
        mock_analyze.return_value = {
            'summary': 'ok', 'headline': 'fine', 'confidence': 90, 'indicators': [],
        }
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())
        analyze_inspection(inspection=self.inspection)

        with self.assertRaises(ValidationError):
            analyze_inspection(inspection=self.inspection)
        image.image.delete(save=False)


class IsResultOwnerPermissionTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876510003', full_name='Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876510004', full_name='Other', password='StrongPass123',
        )
        inspection = make_saved_inspection(self.owner)
        self.result = record_result(inspection=inspection, risk_category=RiskCategory.LOW, summary='ok')
        self.permission = IsResultOwner()

    def test_allows_owner(self):
        request = type('Req', (), {'user': self.owner})()
        self.assertTrue(self.permission.has_object_permission(request, None, self.result))

    def test_denies_other_user(self):
        request = type('Req', (), {'user': self.other})()
        self.assertFalse(self.permission.has_object_permission(request, None, self.result))


class ResultApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            phone_number='+919876510005', full_name='API Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876510006', full_name='API Other', password='StrongPass123',
        )

    def test_requires_authentication(self):
        inspection = make_saved_inspection(self.owner)
        response = self.client.get(f'/api/results/{inspection.pk}/')
        self.assertEqual(response.status_code, 403)

    def test_returns_404_when_no_result_yet(self):
        inspection = make_saved_inspection(self.owner)
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/results/{inspection.pk}/')
        self.assertEqual(response.status_code, 404)

    def test_returns_result_for_owner(self):
        inspection = make_saved_inspection(self.owner)
        record_result(inspection=inspection, risk_category=RiskCategory.UNCERTAIN, summary='Inconclusive.')

        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/results/{inspection.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['risk_category'], 'UNCERTAIN')

    def test_other_user_cannot_access_result(self):
        inspection = make_saved_inspection(self.owner)
        record_result(inspection=inspection, risk_category=RiskCategory.LOW, summary='ok')

        self.client.force_authenticate(user=self.other)
        response = self.client.get(f'/api/results/{inspection.pk}/')
        self.assertEqual(response.status_code, 403)


class BuildBatchTrendServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876510008', full_name='Trend Owner', password='StrongPass123',
        )

    def _make_saved_result(self, batch=None, **findings_overrides):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )
        if batch is not None:
            inspection.batch = batch
            inspection.save(update_fields=['batch'])
        image = add_inspection_image(inspection=inspection, image=make_test_image())

        findings = {
            'summary': 'ok', 'headline': 'Normal', 'confidence': 90, 'indicators': [],
        }
        findings.update(findings_overrides)
        with patch('apps.results.services.analyze_material', return_value=findings):
            result = analyze_inspection(inspection=inspection)
        save_inspection(inspection=inspection)
        image.image.delete(save=False)

        return inspection, result

    def test_no_saved_results_yields_empty_trend(self):
        from apps.batches.services import create_batch_from_inspection

        unanalyzed_inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )
        batch = create_batch_from_inspection(inspection=unanalyzed_inspection)

        trend = build_batch_trend(batch=batch)
        self.assertEqual(trend['points'], [])
        self.assertFalse(trend['is_increasing'])
        self.assertEqual(trend['insight'], '')

    def test_single_point_never_increasing(self):
        inspection, _ = self._make_saved_result()
        batch = ensure_batch_for_inspection(inspection=inspection)

        trend = build_batch_trend(batch=batch)
        self.assertEqual(len(trend['points']), 1)
        self.assertFalse(trend['is_increasing'])
        self.assertEqual(trend['insight'], 'Findings have remained consistent: Normal.')

    def test_worsening_trend_across_multiple_inspections(self):
        first_inspection, _ = self._make_saved_result(
            headline='Normal', indicators=[{'severity': 'none'}],
        )
        batch = ensure_batch_for_inspection(inspection=first_inspection)
        self._make_saved_result(
            batch=batch, headline='Mould detected', indicators=[{'severity': 'severe'}],
        )

        trend = build_batch_trend(batch=batch)
        self.assertEqual(len(trend['points']), 2)
        self.assertTrue(trend['is_increasing'])
        self.assertIn('Normal', trend['insight'])
        self.assertIn('Mould detected', trend['insight'])

    def test_unsaved_draft_excluded_from_trend(self):
        first_inspection, _ = self._make_saved_result()
        batch = ensure_batch_for_inspection(inspection=first_inspection)

        # A second inspection that gets analyzed but never saved.
        draft = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=15,
        )
        draft.batch = batch
        draft.save(update_fields=['batch'])
        image = add_inspection_image(inspection=draft, image=make_test_image())
        with patch('apps.results.services.analyze_material', return_value={
            'summary': 'ok', 'headline': 'Severe', 'confidence': 90, 'indicators': [{'severity': 'severe'}],
        }):
            analyze_inspection(inspection=draft)
        image.image.delete(save=False)

        trend = build_batch_trend(batch=batch)
        self.assertEqual(len(trend['points']), 1)
