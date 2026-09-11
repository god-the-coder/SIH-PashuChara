from .models import Recommendation, RecommendationActionType, RecommendationUrgency


def create_recommendation(
    *, result, text, action_type=RecommendationActionType.GENERAL, urgency=RecommendationUrgency.CORRECTIVE,
):
    return Recommendation.objects.create(result=result, text=text, action_type=action_type, urgency=urgency)
