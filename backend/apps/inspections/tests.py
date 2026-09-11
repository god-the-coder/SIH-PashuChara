import io

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework.test import APIClient

from apps.accounts.models import User

from .models import InspectionStatus, InspectionType, MaterialType
from .permissions import IsInspectionOwner
from .selectors import get_inspection_by_id, list_images_by_inspection, list_inspections_by_owner
from .services import add_inspection_image, create_draft_inspection, save_inspection


def make_test_image(name='test.jpg'):
    buf = io.BytesIO()
    Image.new('RGB', (10, 10), color='green').save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type='image/jpeg')


class InspectionSelectorTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540001', full_name='Owner', password='StrongPass123',
        )
        self.inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=10,
        )

    def test_get_inspection_by_id_found_and_missing(self):
        self.assertEqual(get_inspection_by_id(inspection_id=self.inspection.pk), self.inspection)
        self.assertIsNone(get_inspection_by_id(inspection_id=999999))

    def test_list_inspections_by_owner(self):
        other = User.objects.create_user(
            phone_number='+919876540002', full_name='Other', password='StrongPass123',
        )
        self.assertEqual(list(list_inspections_by_owner(owner=self.owner)), [self.inspection])
        self.assertEqual(list(list_inspections_by_owner(owner=other)), [])

    def test_list_images_by_inspection(self):
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())
        self.assertEqual(list(list_images_by_inspection(inspection=self.inspection)), [image])
        image.image.delete(save=False)


class InspectionServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540003', full_name='Owner', password='StrongPass123',
        )

    def test_create_draft_inspection_defaults_to_draft(self):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=15,
        )
        self.assertEqual(inspection.status, InspectionStatus.DRAFT)
        self.assertIsNone(inspection.saved_at)

    def test_create_draft_inspection_requires_other_text_when_other_selected(self):
        with self.assertRaises(ValidationError):
            create_draft_inspection(
                owner=self.owner, inspection_type=InspectionType.FEED,
                material_type=MaterialType.OTHER, storage_duration_days=5,
            )

    def test_add_inspection_image_rejected_when_not_draft(self):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        save_inspection(inspection=inspection)

        with self.assertRaises(ValidationError):
            add_inspection_image(inspection=inspection, image=make_test_image())

    def test_save_inspection_sets_status_and_timestamp(self):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        saved = save_inspection(inspection=inspection)
        self.assertEqual(saved.status, InspectionStatus.SAVED)
        self.assertIsNotNone(saved.saved_at)

    def test_save_inspection_rejects_already_saved(self):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        save_inspection(inspection=inspection)

        with self.assertRaises(ValidationError):
            save_inspection(inspection=inspection)


class IsInspectionOwnerPermissionTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540004', full_name='Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876540005', full_name='Other', password='StrongPass123',
        )
        self.inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        self.permission = IsInspectionOwner()

    def test_allows_owner(self):
        request = type('Req', (), {'user': self.owner})()
        self.assertTrue(self.permission.has_object_permission(request, None, self.inspection))

    def test_denies_other_user(self):
        request = type('Req', (), {'user': self.other})()
        self.assertFalse(self.permission.has_object_permission(request, None, self.inspection))


class InspectionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            phone_number='+919876540006', full_name='API Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876540007', full_name='API Other', password='StrongPass123',
        )

    def test_create_requires_authentication(self):
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_full_flow_create_list_detail_image_save(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 12,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        inspection_id = response.data['id']
        self.assertEqual(response.data['status'], 'DRAFT')

        response = self.client.get('/api/inspections/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        response = self.client.get(f'/api/inspections/{inspection_id}/')
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart',
        )
        self.assertEqual(response.status_code, 201)

        response = self.client.post(f'/api/inspections/{inspection_id}/save/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'SAVED')
        self.assertEqual(len(response.data['images']), 1)

        response = self.client.post(f'/api/inspections/{inspection_id}/save/')
        self.assertEqual(response.status_code, 400)

    def test_other_user_cannot_access_inspection(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']

        self.client.force_authenticate(user=self.other)
        response = self.client.get(f'/api/inspections/{inspection_id}/')
        self.assertEqual(response.status_code, 403)

    def test_invalid_image_upload_rejected(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']

        bad_file = SimpleUploadedFile('bad.jpg', b'not-an-image', content_type='image/jpeg')
        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/', {'image': bad_file}, format='multipart',
        )
        self.assertEqual(response.status_code, 400)
