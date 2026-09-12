import base64

from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.exceptions import AIServiceError
from ai.groq_guidance import generate_groq_guidance
from apps.batches.selectors import get_batch_by_id
from apps.batches.services import ensure_batch_for_inspection
from apps.results.serializers import ResultSerializer
from apps.results.services import analyze_inspection
from services.translation_service import TranslationService

from .models import Inspection, InspectionStatus
from .permissions import IsInspectionOwner
from .selectors import get_inspection_image_by_id, list_inspections_by_owner
from .serializers import (
    CaptureGuidanceRequestSerializer,
    CreateInspectionSerializer,
    FollowupAnswersSerializer,
    InspectionContextSerializer,
    InspectionImageSerializer,
    InspectionSerializer,
    LiveGuidanceRequestSerializer,
)
from .services import (
    add_inspection_image,
    create_draft_inspection,
    delete_inspection_image,
    generate_capture_guidance,
    generate_followup_questions,
    save_inspection,
    submit_followup_answers,
    update_inspection_context,
)


class InspectionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['inspections'], operation_id='inspections_list',
        parameters=[
            OpenApiParameter(
                'status', OpenApiTypes.STR, OpenApiParameter.QUERY, required=False,
                enum=InspectionStatus.values,
                description='Filter to inspections in this status (e.g. SAVED for Inspection History).',
            ),
        ],
        responses=InspectionSerializer(many=True),
    )
    def get(self, request):
        status_filter = request.query_params.get('status')
        if status_filter and status_filter not in InspectionStatus.values:
            raise ValidationError({'status': [f'Must be one of {InspectionStatus.values}.']})

        inspections = list_inspections_by_owner(owner=request.user, status=status_filter)
        return Response(InspectionSerializer(inspections, many=True).data)

    @extend_schema(
        tags=['inspections'], operation_id='inspections_create',
        request=CreateInspectionSerializer, responses=InspectionSerializer,
    )
    def post(self, request):
        serializer = CreateInspectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        batch_id = validated_data.pop('batch_id', None)
        batch = None
        if batch_id is not None:
            batch = get_batch_by_id(batch_id=batch_id)
            if batch is None or batch.owner_id != request.user.id:
                raise ValidationError({'batch_id': ['Batch not found.']})

        try:
            inspection = create_draft_inspection(owner=request.user, batch=batch, **validated_data)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(InspectionSerializer(inspection).data, status=status.HTTP_201_CREATED)


class InspectionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(tags=['inspections'], operation_id='inspections_retrieve', responses=InspectionSerializer)
    def get(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)
        return Response(InspectionSerializer(inspection).data)


class InspectionImageUploadView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(
        tags=['inspections'], operation_id='inspections_images_create',
        request=InspectionImageSerializer, responses=InspectionImageSerializer,
    )
    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        serializer = InspectionImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            image = add_inspection_image(inspection=inspection, **serializer.validated_data)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(InspectionImageSerializer(image).data, status=status.HTTP_201_CREATED)


class InspectionImageGuidanceView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(
        tags=['inspections'], operation_id='inspections_images_guidance',
        request=CaptureGuidanceRequestSerializer, responses=None,
    )
    def post(self, request, pk, image_id):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        image = get_inspection_image_by_id(inspection=inspection, image_id=image_id)
        if image is None:
            raise Http404

        serializer = CaptureGuidanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            guidance = generate_capture_guidance(image=image, **serializer.validated_data)
        except AIServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(guidance)


class InspectionLiveGuidanceView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(
        tags=['inspections'], operation_id='inspections_live_guidance',
        request=LiveGuidanceRequestSerializer, responses=None,
    )
    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        serializer = LiveGuidanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        raw_data = serializer.validated_data['image']
        if ',' in raw_data:
            raw_data = raw_data.split(',', 1)[1]
        try:
            image_bytes = base64.b64decode(raw_data)
        except Exception:
            raise ValidationError({'image': 'Invalid base64 image data.'})

        guidance = generate_groq_guidance(
            step_label=serializer.validated_data.get('step_label', 'General'),
            step_description=serializer.validated_data.get('step_description', 'Feed sample'),
            image_bytes=image_bytes,
            language=serializer.validated_data.get('language', 'en'),
        )
        return Response(guidance)


class InspectionImageDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(tags=['inspections'], operation_id='inspections_images_delete', request=None, responses=None)
    def delete(self, request, pk, image_id):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        image = get_inspection_image_by_id(inspection=inspection, image_id=image_id)
        if image is None:
            raise Http404

        try:
            delete_inspection_image(inspection=inspection, image=image)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(status=status.HTTP_204_NO_CONTENT)


class InspectionContextView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(
        tags=['inspections'], operation_id='inspections_context_update',
        request=InspectionContextSerializer, responses=InspectionSerializer,
    )
    def patch(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        serializer = InspectionContextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            inspection = update_inspection_context(inspection=inspection, **serializer.validated_data)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(InspectionSerializer(inspection).data)


class InspectionSaveView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(tags=['inspections'], operation_id='inspections_save', request=None, responses=InspectionSerializer)
    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        try:
            inspection = save_inspection(inspection=inspection)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        ensure_batch_for_inspection(inspection=inspection)
        inspection.refresh_from_db()

        return Response(InspectionSerializer(inspection).data)


class InspectionQuestionsView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    def _serialize_with_translations(self, inspection, target_lang):
        data = InspectionSerializer(inspection).data
        if target_lang and target_lang != 'en' and data.get('followup_qa'):
            translator = TranslationService()
            translated_qa = []
            for item in data['followup_qa']:
                q_text = item.get('question', '')
                translated_text = translator.translate_text(q_text, target_lang)
                translated_qa.append({
                    **item,
                    'question_translated': translated_text or q_text,
                })
            data['followup_qa'] = translated_qa
        elif data.get('followup_qa'):
            data['followup_qa'] = [
                {**item, 'question_translated': item.get('question', '')}
                for item in data['followup_qa']
            ]
        return data

    @extend_schema(
        tags=['inspections'], operation_id='inspections_questions_get',
        responses=InspectionSerializer,
    )
    def get(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)
        target_lang = request.query_params.get('lang', 'en')
        return Response(self._serialize_with_translations(inspection, target_lang))

    @extend_schema(
        tags=['inspections'], operation_id='inspections_questions_generate',
        request=None, responses=InspectionSerializer,
    )
    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        target_lang = request.query_params.get('lang') or (request.data.get('lang') if isinstance(request.data, dict) else None) or 'en'
        try:
            inspection = generate_followup_questions(inspection=inspection, language=target_lang)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)
        except AIServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(self._serialize_with_translations(inspection, target_lang))


class InspectionAnswerQuestionsView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(
        tags=['inspections'], operation_id='inspections_questions_answer',
        request=FollowupAnswersSerializer, responses=InspectionSerializer,
    )
    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        serializer = FollowupAnswersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            inspection = submit_followup_answers(
                inspection=inspection,
                answers=serializer.validated_data['answers'],
                questions=serializer.validated_data.get('questions'),
            )
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)

        return Response(InspectionSerializer(inspection).data)


class InspectionAnalyzeView(APIView):
    permission_classes = [IsAuthenticated, IsInspectionOwner]

    @extend_schema(tags=['inspections'], operation_id='inspections_analyze', request=None, responses=ResultSerializer)
    def post(self, request, pk):
        inspection = get_object_or_404(Inspection, pk=pk)
        self.check_object_permissions(request, inspection)

        try:
            result = analyze_inspection(inspection=inspection)
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages)
        except AIServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(ResultSerializer(result).data, status=status.HTTP_201_CREATED)
