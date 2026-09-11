from .models import Recommendation


def list_recommendations_by_result(*, result):
    return Recommendation.objects.filter(result=result).order_by('created_at')
