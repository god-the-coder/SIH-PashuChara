from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.inspections.models import InspectionType, MaterialType
from apps.inspections.services import create_draft_inspection, save_inspection
from apps.results.models import RiskCategory
from apps.results.services import record_result

from .selectors import list_recommendations_by_result
from .services import create_recommendation


def make_result(owner):
    inspection = create_draft_inspection(
        owner=owner, inspection_type=InspectionType.SILAGE,
        material_type=MaterialType.SILAGE, storage_duration_days=7,
    )
    save_inspection(inspection=inspection)
    return record_result(inspection=inspection, risk_category=RiskCategory.CAUTION, summary='Check closely.')


class RecommendationSelectorTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number='+919876521001', full_name='Owner', password='StrongPass123',
        )
        self.result = make_result(self.owner)

    def test_list_recommendations_by_result_ordered(self):
        rec1 = create_recommendation(result=self.result, text='First action.')
        rec2 = create_recommendation(result=self.result, text='Second action.')
        self.assertEqual(list(list_recommendations_by_result(result=self.result)), [rec1, rec2])

    def test_list_recommendations_empty_when_none(self):
        self.assertEqual(list(list_recommendations_by_result(result=self.result)), [])


class CreateRecommendationServiceTests(TestCase):
    def test_create_recommendation_links_to_result(self):
        owner = User.objects.create_user(
            phone_number='+919876521002', full_name='Owner', password='StrongPass123',
        )
        result = make_result(owner)
        rec = create_recommendation(result=result, text='Isolate this batch.')
        self.assertEqual(rec.result, result)
        self.assertEqual(rec.text, 'Isolate this batch.')


class RecommendationNestedInResultApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            phone_number='+919876521003', full_name='API Owner', password='StrongPass123',
        )

    def test_result_response_includes_recommendations_in_order(self):
        result = make_result(self.owner)
        create_recommendation(result=result, text='Reduce storage duration.')
        create_recommendation(result=result, text='Increase ventilation.')

        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/results/{result.inspection_id}/')

        self.assertEqual(response.status_code, 200)
        texts = [item['text'] for item in response.data['recommendations']]
        self.assertEqual(texts, ['Reduce storage duration.', 'Increase ventilation.'])

    def test_result_response_has_empty_recommendations_when_none(self):
        result = make_result(self.owner)

        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/results/{result.inspection_id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['recommendations'], [])
