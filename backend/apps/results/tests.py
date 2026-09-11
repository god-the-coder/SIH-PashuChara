from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.inspections.models import InspectionType, MaterialType
from apps.inspections.services import add_inspection_image, create_draft_inspection, save_inspection

from .models import RiskCategory
from .permissions import IsResultOwner
from .selectors import get_result_by_inspection
from .services import analyze_inspection, record_result


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
