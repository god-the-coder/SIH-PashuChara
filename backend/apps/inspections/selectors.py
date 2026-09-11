from .models import Inspection


def get_inspection_by_id(*, inspection_id):
    return Inspection.objects.filter(pk=inspection_id).first()


def list_inspections_by_owner(*, owner, status=None):
    inspections = Inspection.objects.filter(owner=owner)
    if status is not None:
        inspections = inspections.filter(status=status)
    return inspections.order_by('-created_at')


def list_images_by_inspection(*, inspection):
    return inspection.images.order_by('uploaded_at')


def get_inspection_image_by_id(*, inspection, image_id):
    return inspection.images.filter(pk=image_id).first()
