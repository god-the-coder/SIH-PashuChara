from .models import Recommendation


def create_recommendation(*, result, text):
    return Recommendation.objects.create(result=result, text=text)
