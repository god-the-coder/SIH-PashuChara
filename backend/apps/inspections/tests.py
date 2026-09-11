import io
from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework.test import APIClient

from ai.exceptions import AIServiceError
from apps.accounts.models import User
from weather.exceptions import WeatherServiceError

from .models import ImageType, InspectionStatus, InspectionType, MaterialType, StorageCondition
from .permissions import IsInspectionOwner
from .selectors import get_inspection_by_id, list_images_by_inspection, list_inspections_by_owner
from .services import (
    add_inspection_image,
    create_draft_inspection,
    delete_inspection_image,
    generate_followup_questions,
    save_inspection,
    submit_followup_answers,
    update_inspection_context,
)


def make_test_image(name='test.jpg'):
    # Large enough and noisy enough to pass imaging.validator's usability checks
    # (a real photo, not a tiny solid-color swatch).
    import numpy as np

    rng = np.random.default_rng(seed=0)
    array = rng.integers(0, 255, (300, 300, 3), dtype='uint8')
    buf = io.BytesIO()
    Image.fromarray(array).save(buf, format='JPEG')
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

    def test_list_inspections_by_owner_filters_by_status(self):
        save_inspection(inspection=self.inspection)
        draft = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        self.assertEqual(
            list(list_inspections_by_owner(owner=self.owner, status=InspectionStatus.SAVED)),
            [self.inspection],
        )
        self.assertEqual(
            list(list_inspections_by_owner(owner=self.owner, status=InspectionStatus.DRAFT)),
            [draft],
        )

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

    def test_delete_inspection_image_removes_it_while_draft(self):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        image = add_inspection_image(inspection=inspection, image=make_test_image())

        delete_inspection_image(inspection=inspection, image=image)

        self.assertEqual(list(list_images_by_inspection(inspection=inspection)), [])

    def test_delete_inspection_image_rejected_when_not_draft(self):
        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.FEED,
            material_type=MaterialType.DRY_FODDER, storage_duration_days=5,
        )
        image = add_inspection_image(inspection=inspection, image=make_test_image())
        save_inspection(inspection=inspection)

        with self.assertRaises(ValidationError):
            delete_inspection_image(inspection=inspection, image=image)
        image.image.delete(save=False)

    def test_create_draft_inspection_can_attach_to_owned_batch(self):
        from apps.batches.services import create_batch_from_inspection

        first = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )
        batch = create_batch_from_inspection(inspection=first)

        inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=8, batch=batch,
        )
        self.assertEqual(inspection.batch_id, batch.pk)

    def test_create_draft_inspection_rejects_batch_owned_by_someone_else(self):
        from apps.batches.services import create_batch_from_inspection

        other = User.objects.create_user(
            phone_number='+919876540099', full_name='Other', password='StrongPass123',
        )
        other_inspection = create_draft_inspection(
            owner=other, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )
        batch = create_batch_from_inspection(inspection=other_inspection)

        with self.assertRaises(ValidationError):
            create_draft_inspection(
                owner=self.owner, inspection_type=InspectionType.SILAGE,
                material_type=MaterialType.SILAGE, storage_duration_days=8, batch=batch,
            )

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

    def test_image_upload_defaults_to_front_general_type(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']

        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart',
        )
        self.assertEqual(response.data['image_type'], 'FRONT_GENERAL')

    def test_image_upload_accepts_explicit_type(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']

        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/',
            {'image': make_test_image(), 'image_type': 'MACRO'}, format='multipart',
        )
        self.assertEqual(response.data['image_type'], 'MACRO')

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

    def test_history_filter_returns_only_saved_inspections(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        saved_id = response.data['id']
        self.client.post(f'/api/inspections/{saved_id}/save/')

        self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')

        response = self.client.get('/api/inspections/', {'status': 'SAVED'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], saved_id)

    def test_history_filter_rejects_invalid_status(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/inspections/', {'status': 'NOT_A_STATUS'})
        self.assertEqual(response.status_code, 400)

    def test_delete_image_removes_it_while_draft(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']

        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart',
        )
        image_id = response.data['id']

        response = self.client.delete(f'/api/inspections/{inspection_id}/images/{image_id}/')
        self.assertEqual(response.status_code, 204)

        response = self.client.get(f'/api/inspections/{inspection_id}/')
        self.assertEqual(response.data['images'], [])

    def test_delete_image_rejected_after_save(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']

        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart',
        )
        image_id = response.data['id']
        self.client.post(f'/api/inspections/{inspection_id}/save/')

        response = self.client.delete(f'/api/inspections/{inspection_id}/images/{image_id}/')
        self.assertEqual(response.status_code, 400)

    def test_delete_image_denies_other_user(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'FEED', 'material_type': 'DRY_FODDER', 'storage_duration_days': 5,
        }, format='json')
        inspection_id = response.data['id']
        response = self.client.post(
            f'/api/inspections/{inspection_id}/images/', {'image': make_test_image()}, format='multipart',
        )
        image_id = response.data['id']

        self.client.force_authenticate(user=self.other)
        response = self.client.delete(f'/api/inspections/{inspection_id}/images/{image_id}/')
        self.assertEqual(response.status_code, 403)

    def test_reinspect_creates_inspection_attached_to_batch(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 10,
        }, format='json')
        first_id = response.data['id']
        response = self.client.post(f'/api/inspections/{first_id}/save/')
        batch_id = response.data['batch']

        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 8,
            'batch_id': batch_id,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['batch'], batch_id)

    def test_reinspect_rejects_batch_owned_by_someone_else(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 10,
        }, format='json')
        first_id = response.data['id']
        response = self.client.post(f'/api/inspections/{first_id}/save/')
        batch_id = response.data['batch']

        self.client.force_authenticate(user=self.other)
        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 8,
            'batch_id': batch_id,
        }, format='json')
        self.assertEqual(response.status_code, 400)


class FollowupQuestionServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540008', full_name='Owner', password='StrongPass123',
        )
        self.inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )

    def test_generate_followup_questions_requires_image(self):
        with self.assertRaises(ValidationError):
            generate_followup_questions(inspection=self.inspection)

    @patch('apps.inspections.services.ai_generate_followup_questions')
    def test_generate_followup_questions_stores_questions(self, mock_generate):
        mock_generate.return_value = ['Any smell?', 'Any mold?']
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())

        generate_followup_questions(inspection=self.inspection)

        self.assertEqual(
            self.inspection.followup_qa,
            [{'question': 'Any smell?', 'answer': None}, {'question': 'Any mold?', 'answer': None}],
        )
        image.image.delete(save=False)

    @patch('apps.inspections.services.ai_generate_followup_questions')
    def test_generate_followup_questions_rejects_when_not_draft(self, mock_generate):
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())
        save_inspection(inspection=self.inspection)

        with self.assertRaises(ValidationError):
            generate_followup_questions(inspection=self.inspection)
        mock_generate.assert_not_called()
        image.image.delete(save=False)

    def test_submit_followup_answers_requires_existing_questions(self):
        with self.assertRaises(ValidationError):
            submit_followup_answers(inspection=self.inspection, answers=['yes'])

    @patch('apps.inspections.services.ai_generate_followup_questions')
    def test_submit_followup_answers_rejects_count_mismatch(self, mock_generate):
        mock_generate.return_value = ['Q1?', 'Q2?']
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())
        generate_followup_questions(inspection=self.inspection)

        with self.assertRaises(ValidationError):
            submit_followup_answers(inspection=self.inspection, answers=['only one'])
        image.image.delete(save=False)

    @patch('apps.inspections.services.ai_generate_followup_questions')
    def test_submit_followup_answers_fills_answers(self, mock_generate):
        mock_generate.return_value = ['Q1?', 'Q2?']
        image = add_inspection_image(inspection=self.inspection, image=make_test_image())
        generate_followup_questions(inspection=self.inspection)

        submit_followup_answers(inspection=self.inspection, answers=['A1', 'A2'])

        self.assertEqual(
            self.inspection.followup_qa,
            [{'question': 'Q1?', 'answer': 'A1'}, {'question': 'Q2?', 'answer': 'A2'}],
        )
        image.image.delete(save=False)


class UpdateInspectionContextServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876540010', full_name='Owner', password='StrongPass123',
        )
        self.inspection = create_draft_inspection(
            owner=self.owner, inspection_type=InspectionType.SILAGE,
            material_type=MaterialType.SILAGE, storage_duration_days=10,
        )

    @patch('apps.inspections.services.fetch_current_weather')
    def test_updates_farmer_fields_and_fetches_weather(self, mock_weather):
        mock_weather.return_value = {'temperature_celsius': 31.0, 'humidity_percent': 74.0}

        update_inspection_context(
            inspection=self.inspection, latitude=19.9975, longitude=73.7898,
            storage_condition=StorageCondition.POOR, moisture_exposure=True,
            farmer_observation='Unusual smell noticed',
        )

        self.assertEqual(self.inspection.temperature_celsius, 31.0)
        self.assertEqual(self.inspection.humidity_percent, 74.0)
        self.assertEqual(self.inspection.storage_condition, StorageCondition.POOR)
        self.assertTrue(self.inspection.moisture_exposure)
        self.assertEqual(self.inspection.farmer_observation, 'Unusual smell noticed')

    @patch('apps.inspections.services.fetch_current_weather')
    def test_weather_failure_does_not_block_other_fields(self, mock_weather):
        mock_weather.side_effect = WeatherServiceError('provider down')

        update_inspection_context(
            inspection=self.inspection, latitude=19.9975, longitude=73.7898,
            farmer_observation='test note',
        )

        self.assertIsNone(self.inspection.temperature_celsius)
        self.assertEqual(self.inspection.latitude, 19.9975)
        self.assertEqual(self.inspection.farmer_observation, 'test note')

    def test_rejects_when_not_draft(self):
        save_inspection(inspection=self.inspection)
        with self.assertRaises(ValidationError):
            update_inspection_context(inspection=self.inspection, farmer_observation='too late')


class AIEndpointApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            phone_number='+919876540009', full_name='Owner', password='StrongPass123',
        )
        self.client.force_authenticate(user=self.owner)

        response = self.client.post('/api/inspections/', {
            'inspection_type': 'SILAGE', 'material_type': 'SILAGE', 'storage_duration_days': 30,
        }, format='json')
        self.inspection_id = response.data['id']
        self.client.post(
            f'/api/inspections/{self.inspection_id}/images/', {'image': make_test_image()}, format='multipart',
        )

    @patch('apps.inspections.views.generate_followup_questions')
    def test_questions_endpoint_returns_502_on_ai_failure(self, mock_generate):
        mock_generate.side_effect = AIServiceError('provider down')
        response = self.client.post(f'/api/inspections/{self.inspection_id}/questions/')
        self.assertEqual(response.status_code, 502)

    @patch('apps.inspections.services.ai_generate_followup_questions')
    def test_full_ai_flow_mocked(self, mock_generate):
        mock_generate.return_value = ['Any smell?']

        response = self.client.post(f'/api/inspections/{self.inspection_id}/questions/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['followup_qa']), 1)

        response = self.client.post(
            f'/api/inspections/{self.inspection_id}/questions/answer/', {'answers': ['No smell.']}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['followup_qa'][0]['answer'], 'No smell.')

        with patch('apps.results.services.analyze_material') as mock_analyze:
            mock_analyze.return_value = {
                'summary': 'Looks fine.', 'headline': 'No issues', 'confidence': 90, 'indicators': [],
            }
            response = self.client.post(f'/api/inspections/{self.inspection_id}/analyze/')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['risk_category'], 'LOW')
        self.assertEqual(len(response.data['recommendations']), 1)

    @patch('apps.inspections.services.fetch_current_weather')
    def test_context_endpoint_updates_inspection(self, mock_weather):
        mock_weather.return_value = {'temperature_celsius': 31.0, 'humidity_percent': 74.0}

        response = self.client.patch(f'/api/inspections/{self.inspection_id}/context/', {
            'latitude': 19.9975, 'longitude': 73.7898, 'storage_condition': 'POOR',
            'moisture_exposure': True, 'farmer_observation': 'Unusual smell noticed',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['temperature_celsius'], 31.0)
        self.assertEqual(response.data['storage_condition'], 'POOR')
        self.assertEqual(response.data['farmer_observation'], 'Unusual smell noticed')

    def test_context_endpoint_rejects_lat_without_lon(self):
        response = self.client.patch(
            f'/api/inspections/{self.inspection_id}/context/', {'latitude': 19.9975}, format='json',
        )
        self.assertEqual(response.status_code, 400)
