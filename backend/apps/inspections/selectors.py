from .models import Inspection


def get_inspection_by_id(*, inspection_id):
    return Inspection.objects.filter(pk=inspection_id).first()


def list_inspections_by_owner(*, owner):
    return Inspection.objects.filter(owner=owner).order_by('-created_at')


def list_images_by_inspection(*, inspection):
    return inspection.images.order_by('uploaded_at')
