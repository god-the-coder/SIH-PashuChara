from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import PhoneOTP, User
from .permissions import IsSelf
from .selectors import get_user_by_id, get_user_by_phone_number
from .services import register_user


class UserManagerTests(TestCase):
    def test_create_user_sets_hashed_password(self):
        user = User.objects.create_user(
            phone_number='+919876500001', full_name='Manager Test', password='StrongPass123',
        )
        self.assertTrue(user.check_password('StrongPass123'))
        self.assertFalse(user.is_staff)

    def test_create_superuser_sets_flags(self):
        user = User.objects.create_superuser(
            phone_number='+919876500002', full_name='Admin', password='StrongPass123',
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)


class SelectorTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+919876500003', full_name='Selector Test', password='StrongPass123',
        )

    def test_get_user_by_id_found_and_missing(self):
        self.assertEqual(get_user_by_id(user_id=self.user.pk), self.user)
        self.assertIsNone(get_user_by_id(user_id=999999))

    def test_get_user_by_phone_number_found_and_missing(self):
        self.assertEqual(get_user_by_phone_number(phone_number='+919876500003'), self.user)
        self.assertIsNone(get_user_by_phone_number(phone_number='+910000000000'))


class RegisterUserServiceTests(TestCase):
    def test_register_user_creates_account(self):
        user = register_user(phone_number='+919876500004', full_name='Service Test', password='StrongPass123')
        self.assertTrue(user.check_password('StrongPass123'))

    def test_register_user_rejects_duplicate_phone(self):
        register_user(phone_number='+919876500005', full_name='First', password='StrongPass123')
        with self.assertRaises(ValidationError):
            register_user(phone_number='+919876500005', full_name='Second', password='StrongPass123')

    def test_register_user_rejects_weak_password(self):
        with self.assertRaises(ValidationError):
            register_user(phone_number='+919876500006', full_name='Weak', password='123')


class IsSelfPermissionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+919876500007', full_name='User One', password='StrongPass123',
        )
        self.other = User.objects.create_user(
            phone_number='+919876500008', full_name='User Two', password='StrongPass123',
        )
        self.permission = IsSelf()

    def test_allows_own_account(self):
        request = type('Req', (), {'user': self.user})()
        self.assertTrue(self.permission.has_object_permission(request, None, self.user))

    def test_denies_other_account(self):
        request = type('Req', (), {'user': self.other})()
        self.assertFalse(self.permission.has_object_permission(request, None, self.user))


class AccountsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.phone_number = '+919876500009'
        self.password = 'StrongPass123'

    def test_register_login_me_logout_flow(self):
        response = self.client.post('/api/accounts/register/', {
            'phone_number': self.phone_number,
            'full_name': 'Flow Test',
            'password': self.password,
        }, format='json')
        self.assertEqual(response.status_code, 201)

        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 403)

        response = self.client.post('/api/accounts/login/', {
            'phone_number': self.phone_number,
            'password': 'wrong-password',
        }, format='json')
        self.assertEqual(response.status_code, 401)

        response = self.client.post('/api/accounts/login/', {
            'phone_number': self.phone_number,
            'password': self.password,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['phone_number'], self.phone_number)

        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['phone_number'], self.phone_number)

        response = self.client.post('/api/accounts/logout/')
        self.assertEqual(response.status_code, 204)

        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 403)

    def test_register_rejects_duplicate_phone(self):
        payload = {'phone_number': self.phone_number, 'full_name': 'First', 'password': self.password}
        self.client.post('/api/accounts/register/', payload, format='json')

        response = self.client.post('/api/accounts/register/', payload, format='json')
        self.assertEqual(response.status_code, 400)

    @override_settings(DEBUG=True)
    def test_send_and_verify_otp_flow(self):
        # 1. Send OTP
        phone = '+919999911111'
        res = self.client.post('/api/accounts/otp/send/', {'phone_number': phone}, format='json')
        self.assertEqual(res.status_code, 200)
        otp = res.data.get('dev_otp')
        self.assertTrue(otp)
        self.assertEqual(len(otp), 6)

        # 2. Verify with wrong OTP
        res_fail = self.client.post('/api/accounts/otp/verify/', {
            'phone_number': phone,
            'otp': '000000',
        }, format='json')
        self.assertEqual(res_fail.status_code, 400)

        # 3. Verify with valid OTP and auto-register
        res_ok = self.client.post('/api/accounts/otp/verify/', {
            'phone_number': phone,
            'otp': otp,
            'full_name': 'OTP Farmer',
        }, format='json')
        self.assertEqual(res_ok.status_code, 200)
        self.assertEqual(res_ok.data['phone_number'], phone)
        self.assertEqual(res_ok.data['full_name'], 'OTP Farmer')
        self.assertIn('X-CSRFToken', res_ok)

        # 4. Check authenticated session
        me_res = self.client.get('/api/accounts/me/')
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.data['phone_number'], phone)

    def test_google_login_flow(self):
        email = 'farmer@gmail.com'
        google_id = 'gid_123456789'
        res = self.client.post('/api/accounts/google/', {
            'email': email,
            'google_id': google_id,
            'full_name': 'Google Farmer',
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['email'], email)
        self.assertEqual(res.data['full_name'], 'Google Farmer')
        self.assertIn('X-CSRFToken', res)

        # Subsequent sign-in with same google_id retrieves user
        res2 = self.client.post('/api/accounts/google/', {
            'email': email,
            'google_id': google_id,
        }, format='json')
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.data['id'], res.data['id'])
