from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User

from .permissions import IsFarmOwner
from .selectors import get_farm_by_id, get_farm_by_owner
from .services import create_farm, update_farm


class FarmSelectorTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876520001', full_name='Owner', password='StrongPass123',
        )
        self.farm = create_farm(owner=self.owner, farm_name='Selector Farm', location='Solapur')

    def test_get_farm_by_owner_found_and_missing(self):
        other = User.objects.create_user(
            phone_number='+919876520002', full_name='No Farm', password='StrongPass123',
        )
        self.assertEqual(get_farm_by_owner(owner=self.owner), self.farm)
        self.assertIsNone(get_farm_by_owner(owner=other))

    def test_get_farm_by_id_found_and_missing(self):
        self.assertEqual(get_farm_by_id(farm_id=self.farm.pk), self.farm)
        self.assertIsNone(get_farm_by_id(farm_id=999999))


class FarmServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876520003', full_name='Owner', password='StrongPass123',
        )

    def test_create_farm(self):
        farm = create_farm(owner=self.owner, farm_name='Service Farm', location='Latur')
        self.assertEqual(farm.owner, self.owner)

    def test_create_farm_rejects_second_farm_for_same_owner(self):
        create_farm(owner=self.owner, farm_name='First', location='Latur')
        with self.assertRaises(ValidationError):
            create_farm(owner=self.owner, farm_name='Second', location='Elsewhere')

    def test_update_farm_partial(self):
        farm = create_farm(owner=self.owner, farm_name='Original', location='Latur')
        update_farm(farm=farm, location='Updated Location')
        farm.refresh_from_db()
        self.assertEqual(farm.farm_name, 'Original')
        self.assertEqual(farm.location, 'Updated Location')

    def test_create_farm_defaults_total_cattle_to_zero(self):
        farm = create_farm(owner=self.owner, farm_name='Zero Cattle', location='Latur')
        self.assertEqual(farm.total_cattle, 0)

    def test_create_farm_with_total_cattle(self):
        farm = create_farm(owner=self.owner, farm_name='Herd Farm', location='Latur', total_cattle=24)
        self.assertEqual(farm.total_cattle, 24)

    def test_update_farm_total_cattle(self):
        farm = create_farm(owner=self.owner, farm_name='Original', location='Latur')
        update_farm(farm=farm, total_cattle=10)
        farm.refresh_from_db()
        self.assertEqual(farm.total_cattle, 10)


class IsFarmOwnerPermissionTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876520004', full_name='Owner', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876520005', full_name='Other', password='StrongPass123',
        )
        self.farm = create_farm(owner=self.owner, farm_name='Perm Farm', location='Beed')
        self.permission = IsFarmOwner()

    def test_allows_owner(self):
        request = type('Req', (), {'user': self.owner})()
        self.assertTrue(self.permission.has_object_permission(request, None, self.farm))

    def test_denies_other_user(self):
        request = type('Req', (), {'user': self.other})()
        self.assertFalse(self.permission.has_object_permission(request, None, self.farm))


class FarmApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone_number='+919876520006', full_name='API Farmer', password='StrongPass123',
        )

    def test_get_requires_authentication(self):
        response = self.client.get('/api/farms/me/')
        self.assertEqual(response.status_code, 403)

    def test_get_returns_404_when_no_farm(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/farms/me/')
        self.assertEqual(response.status_code, 404)

    def test_create_get_and_patch_flow(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            '/api/farms/me/', {'farm_name': 'API Farm', 'location': 'Nanded', 'total_cattle': 12}, format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['total_cattle'], 12)

        response = self.client.get('/api/farms/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['farm_name'], 'API Farm')

        response = self.client.patch('/api/farms/me/', {'location': 'Jalna', 'total_cattle': 18}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['location'], 'Jalna')
        self.assertEqual(response.data['farm_name'], 'API Farm')
        self.assertEqual(response.data['total_cattle'], 18)

    def test_create_rejects_second_farm(self):
        self.client.force_authenticate(user=self.user)
        payload = {'farm_name': 'First', 'location': 'Nanded'}
        self.client.post('/api/farms/me/', payload, format='json')

        response = self.client.post('/api/farms/me/', {'farm_name': 'Second', 'location': 'Elsewhere'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_farms_are_isolated_per_owner(self):
        other = User.objects.create_user(
            phone_number='+919876520007', full_name='Other Farmer', password='StrongPass123',
        )
        create_farm(owner=other, farm_name='Other Farm', location='Elsewhere')

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/farms/me/')
        self.assertEqual(response.status_code, 404)
