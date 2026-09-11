from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.inspections.models import InspectionType, MaterialType
from apps.inspections.services import add_inspection_image, create_draft_inspection, save_inspection

from .permissions import IsBatchOwner
from .selectors import get_batch_by_code, get_batch_by_id, list_batches_by_owner
from .services import create_batch_from_inspection, ensure_batch_for_inspection, generate_batch_qr_png, update_batch


def make_test_image():
    import io

    from PIL import Image
    buf = io.BytesIO()
    Image.new('RGB', (10, 10), color='green').save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile('test.jpg', buf.read(), content_type='image/jpeg')


def make_inspection(owner):
    return create_draft_inspection(
        owner=owner, inspection_type=InspectionType.SILAGE,
        material_type=MaterialType.SILAGE, storage_duration_days=10,
    )


class BatchSelectorTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876530001', full_name='Owner', password='StrongPass123',
        )
        self.batch = create_batch_from_inspection(inspection=make_inspection(self.owner))

    def test_get_batch_by_id_found_and_missing(self):
        self.assertEqual(get_batch_by_id(batch_id=self.batch.pk), self.batch)
        self.assertIsNone(get_batch_by_id(batch_id=999999))

    def test_list_batches_by_owner(self):
        other = User.objects.create_user(
            phone_number='+919876530002', full_name='Other', password='StrongPass123',
        )
        self.assertEqual(list(list_batches_by_owner(owner=self.owner)), [self.batch])
        self.assertEqual(list(list_batches_by_owner(owner=other)), [])

    def test_get_batch_by_code_found_and_missing(self):
        self.assertEqual(get_batch_by_code(batch_code=self.batch.batch_code), self.batch)
        self.assertIsNone(get_batch_by_code(batch_code='PC-NOTFOUND'))


class BatchServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876530003', full_name='Owner', password='StrongPass123',
        )

    def test_create_batch_from_inspection_copies_type_fields(self):
        inspection = make_inspection(self.owner)
        batch = create_batch_from_inspection(inspection=inspection)
        self.assertEqual(batch.owner, self.owner)
        self.assertEqual(batch.inspection_type, inspection.inspection_type)
        self.assertEqual(batch.material_type, inspection.material_type)
        self.assertEqual(batch.batch_label, f'Batch #{batch.pk}')

    def test_ensure_batch_for_inspection_creates_once(self):
        inspection = make_inspection(self.owner)
        self.assertIsNone(inspection.batch_id)

        batch = ensure_batch_for_inspection(inspection=inspection)
        inspection.refresh_from_db()
        self.assertEqual(inspection.batch_id, batch.pk)

        batch_again = ensure_batch_for_inspection(inspection=inspection)
        self.assertEqual(batch_again.pk, batch.pk)

    def test_update_batch_partial(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        update_batch(batch=batch, quantity_kg=150)
        batch.refresh_from_db()
        self.assertEqual(batch.quantity_kg, 150)
        self.assertEqual(batch.batch_label, f'Batch #{batch.pk}')

    def test_create_batch_from_inspection_assigns_unique_code(self):
        batch_one = create_batch_from_inspection(inspection=make_inspection(self.owner))
        batch_two = create_batch_from_inspection(inspection=make_inspection(self.owner))

        self.assertTrue(batch_one.batch_code.startswith('PC-'))
        self.assertNotEqual(batch_one.batch_code, batch_two.batch_code)

    def test_generate_batch_qr_png_returns_valid_png_bytes(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        png_bytes = generate_batch_qr_png(batch=batch)
        self.assertTrue(png_bytes.startswith(b'\x89PNG'))


class IsBatchOwnerPermissionTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876530004', full_name='Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876530005', full_name='Other', password='StrongPass123',
        )
        self.batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.permission = IsBatchOwner()

    def test_allows_owner(self):
        request = type('Req', (), {'user': self.owner})()
        self.assertTrue(self.permission.has_object_permission(request, None, self.batch))

    def test_denies_other_user(self):
        request = type('Req', (), {'user': self.other})()
        self.assertFalse(self.permission.has_object_permission(request, None, self.batch))


class BatchApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            phone_number='+919876530006', full_name='API Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876530007', full_name='API Other', password='StrongPass123',
        )

    def test_list_requires_authentication(self):
        response = self.client.get('/api/batches/')
        self.assertEqual(response.status_code, 403)

    def test_saving_inspection_auto_creates_batch(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 10,
        }, format='json')
        inspection_id = response.data['id']
        self.assertIsNone(response.data['batch'])

        response = self.client.post(f'/api/inspections/{inspection_id}/save/')
        self.assertIsNotNone(response.data['batch'])
        batch_id = response.data['batch']

        response = self.client.get('/api/batches/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], batch_id)

        response = self.client.get(f'/api/batches/{batch_id}/')
        self.assertEqual(response.status_code, 200)

    def test_patch_updates_only_writable_fields(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(f'/api/batches/{batch.pk}/', {
            'batch_label': 'Renamed', 'quantity_kg': 200, 'inspection_type': 'FEED',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['batch_label'], 'Renamed')
        self.assertEqual(response.data['quantity_kg'], 200)
        self.assertEqual(response.data['inspection_type'], 'SILAGE')

    def test_other_user_cannot_access_batch(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.other)

        response = self.client.get(f'/api/batches/{batch.pk}/')
        self.assertEqual(response.status_code, 403)

    def test_trend_endpoint_returns_points(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 10,
        }, format='json')
        inspection_id = response.data['id']
        self.client.post(f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart')

        with patch('apps.results.services.analyze_material') as mock_analyze:
            mock_analyze.return_value = {
                'summary': 'ok', 'headline': 'Normal', 'confidence': 90, 'indicators': [],
            }
            self.client.post(f'/api/inspections/{inspection_id}/analyze/')

        response = self.client.post(f'/api/inspections/{inspection_id}/save/')
        batch_id = response.data['batch']

        response = self.client.get(f'/api/batches/{batch_id}/trend/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['points']), 1)
        self.assertFalse(response.data['is_increasing'])

    def test_trend_endpoint_requires_authentication(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        response = self.client.get(f'/api/batches/{batch.pk}/trend/')
        self.assertEqual(response.status_code, 403)

    def test_trend_endpoint_denies_other_user(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.other)

        response = self.client.get(f'/api/batches/{batch.pk}/trend/')
        self.assertEqual(response.status_code, 403)

    def test_qr_endpoint_returns_png(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(f'/api/batches/{batch.pk}/qr/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'image/png')
        self.assertTrue(response.content.startswith(b'\x89PNG'))

    def test_qr_endpoint_denies_other_user(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.other)

        response = self.client.get(f'/api/batches/{batch.pk}/qr/')
        self.assertEqual(response.status_code, 403)

    def test_resolve_by_code_returns_summary_with_latest_result(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 10,
        }, format='json')
        inspection_id = response.data['id']
        self.client.post(f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart')

        with patch('apps.results.services.analyze_material') as mock_analyze:
            mock_analyze.return_value = {
                'summary': 'ok', 'headline': 'Normal', 'confidence': 90, 'indicators': [],
            }
            self.client.post(f'/api/inspections/{inspection_id}/analyze/')

        response = self.client.post(f'/api/inspections/{inspection_id}/save/')
        batch_id = response.data['batch']
        batch_code = get_batch_by_id(batch_id=batch_id).batch_code

        response = self.client.get(f'/api/batches/by-code/{batch_code}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], batch_id)
        self.assertIsNotNone(response.data['latest_result'])
        self.assertEqual(response.data['latest_result']['headline'], 'Normal')

    def test_resolve_by_code_returns_none_when_no_result_yet(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(f'/api/batches/by-code/{batch.batch_code}/')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['latest_result'])

    def test_resolve_by_code_denies_other_user(self):
        batch = create_batch_from_inspection(inspection=make_inspection(self.owner))
        self.client.force_authenticate(user=self.other)

        response = self.client.get(f'/api/batches/by-code/{batch.batch_code}/')
        self.assertEqual(response.status_code, 403)

    def test_resolve_by_code_unknown_code_returns_404(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/batches/by-code/PC-NOTFOUND/')
        self.assertEqual(response.status_code, 404)
