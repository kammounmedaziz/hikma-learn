import os
import logging
import requests
from django.core.exceptions import ValidationError
import webvtt
from django.db.models import QuerySet
from rest_framework import serializers
from .models import Course, CourseFollow, Chapter, Content, ContentKind
from rest_framework.reverse import reverse
import webvtt
import cloudflare

logger = logging.getLogger(__name__)

class CourseSerializer(serializers.ModelSerializer):
    teacher = serializers.ReadOnlyField(source='teacher.username')
    chapters_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'url', 'chapters_url', 'title', 'description', 'cover_photo', 'creation_date', 'updated_date', 'teacher']

    def get_chapters_url(self, obj):
        return reverse('chapter-list', kwargs={'course_pk': obj.pk}, request=self.context.get('request'))

class CourseFollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFollow
        fields = ['id', 'student', 'course', 'follow_date']
        read_only_fields = ['id', 'student', 'follow_date']

class ChapterSerializer(serializers.ModelSerializer):
    chapter_url = serializers.SerializerMethodField()
    contents_url = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ['id', 'chapter_url', 'contents_url', 'title', 'description', 'order', 'creation_date', 'updated_date']
        read_only_fields = ['creation_date', 'updated_date', 'order']

    def get_chapter_url(self, obj):
        request = self.context.get('request')
        return reverse('chapter-detail', kwargs={'course_pk': obj.course_id, 'pk': obj.pk}, request=request)

    def get_contents_url(self, obj):
        request = self.context.get('request')
        return reverse('content-list', kwargs={'course_pk': obj.course_id, 'chapter_pk': obj.pk}, request=request)

class ReorderSerializer(serializers.Serializer):
    item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

class ContentSerializer(serializers.ModelSerializer):
    content_url = serializers.SerializerMethodField()
    subtitle_file = serializers.FileField(required=False, allow_null=True)
    transcript_text = serializers.SerializerMethodField()
    image_alt_text = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    generate_alt_text = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Content
        fields = [
            'id', 'content_url', 'title', 'content_kind',
            'url', 'file', 'file_kind', 'file_mime_type',
            'text', 'order', 'subtitle_file',
            'transcript_text', 'image_alt_text', 'creation_date', 'updated_date',
            'generate_alt_text'
        ]
        read_only_fields = ['order', 'file_mime_type', 'file_kind', 'creation_date', 'updated_date']

    def get_content_url(self, obj):
        try:
            request = self.context.get('request')
            return reverse('content-detail', kwargs={'course_pk': obj.chapter.course_id, 'chapter_pk': obj.chapter_id, 'pk': obj.pk }, request=request)
        except (AttributeError, Chapter.DoesNotExist):
            return None

    def get_transcript_text(self, obj):
        if obj.subtitle_file:
            try:
                from io import StringIO
                # Reset file pointer just in case it was already read
                obj.subtitle_file.seek(0)
                content = obj.subtitle_file.read().decode('utf-8', errors='ignore')
                obj.subtitle_file.seek(0)  # Optional: reset again after reading
                buffer = StringIO(content)
                vtt = webvtt.read_buffer(buffer)
                return ' '.join([cue.text.strip() for cue in vtt])
            except Exception:
                return ''
        return ''

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['image_alt_text'] == '':
            representation['image_alt_text'] = None
        return representation

    def validate(self, attrs):
        kind = attrs.get('content_kind', self.instance and self.instance.content_kind)

        def get_field_value(field):
            if field in attrs:
                return attrs[field]
            if self.instance:
                return getattr(self.instance, field, None)
            return None

        errors = {}

        if kind == ContentKind.FILE:
            file_val = get_field_value('file')
            if not file_val:
                raise serializers.ValidationError({'file': 'This field is required for content type FILE.'})

        elif kind == ContentKind.LINK:
            url_val = get_field_value('url')
            if not url_val:
                errors['url'] = 'This field is required for content type LINK.'

        elif kind == ContentKind.TEXT:
            text_val = get_field_value('text')
            if not text_val or not text_val.strip():
                errors['text'] = 'This field is required for content type TEXT.'

        if kind != ContentKind.TEXT and get_field_value('text'):
            errors['text'] = 'The text field should only be filled for content type TEXT.'
        if kind != ContentKind.LINK and get_field_value('url'):
            errors['url'] = 'The URL field should only be filled for content type LINK.'
        if kind != ContentKind.FILE and get_field_value('file'):
            errors['file'] = 'The file field should only be filled for content type FILE.'
        quiz_val = attrs.get('quiz') or (getattr(self.instance, 'quiz', None) if self.instance else None)
        if kind != ContentKind.QUIZ and quiz_val:
            errors['quiz'] = 'The quiz field should only be filled for content type QUIZ.'

        image_alt_text = attrs.get('image_alt_text', None)
        if image_alt_text == '':
            attrs['image_alt_text'] = None

        if image_alt_text and kind != ContentKind.FILE:
            errors['image_alt_text'] = 'Alt text should only be provided for image files.'

        if image_alt_text and kind == ContentKind.FILE:
            file_mime_type = None
            file_val = get_field_value('file')
            if file_val and hasattr(file_val, 'content_type'):
                file_mime_type = file_val.content_type
            elif self.instance and self.instance.file_mime_type:
                file_mime_type = self.instance.file_mime_type

            if file_mime_type and not file_mime_type.startswith('image/'):
                errors['image_alt_text'] = 'Alt text should only be provided for image files.'

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def _generate_and_save_alt_text(self, instance):
        try:
            if not os.path.exists(instance.file.path):
                logger.error(f"Image file not found: {instance.file.path}")
                raise ValidationError(f"Image file not found: {instance.file.path}")
            
            with open(instance.file.path, 'rb') as f:
                image_bytes = f.read()
            
            instance.image_alt_text = self._generate_alt_text(instance, image_bytes)
            instance.save(update_fields=['image_alt_text'])
            logger.info(f"Alt text generated and saved for content {instance.id}: {instance.image_alt_text}")
        except Exception as e:
            logger.error(f"Failed to generate alt text for content {instance.id}: {str(e)}")
            raise ValidationError(f"Error generating alt text: {str(e)}")

    def _generate_alt_text(self, instance, image_bytes):
        ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID')
        API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
        if not ACCOUNT_ID or not API_TOKEN:
            logger.error("Cloudflare credentials missing.")
            raise ValidationError("Cloudflare credentials missing.")

        MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
        if len(image_bytes) > MAX_IMAGE_SIZE:
            logger.error(f"Image size exceeds Cloudflare API limit: {len(image_bytes)} bytes")
            raise ValidationError("Image size exceeds Cloudflare API limit.")

        SUPPORTED_FORMATS = {'image/jpeg', 'image/png', 'image/webp'}
        file_mime_type = instance.file_mime_type if hasattr(instance, 'file_mime_type') else None
        if file_mime_type not in SUPPORTED_FORMATS:
            logger.error(f"Unsupported image format: {file_mime_type}")
            raise ValidationError(f"Unsupported image format: {file_mime_type}. Supported formats: {', '.join(SUPPORTED_FORMATS)}")

        try:
            client = cloudflare.Cloudflare(api_token=API_TOKEN)
            data = client.ai.run(
                "@cf/llava-hf/llava-1.5-7b-hf",
                account_id=ACCOUNT_ID,
                image=image_bytes,
                prompt="Generate a concise alt text description for this image.",
                max_tokens=2048
            )
            description = data['description']
            if not description:
                logger.error("No description generated by Cloudflare API")
                raise ValidationError("No description generated by Cloudflare API")
            logger.info(f"Alt text generated: {description}")
            return description.strip()
        except Exception as e:
            logger.error(f"Error generating alt text: {str(e)}")
            raise ValidationError(f"Error generating alt text: {str(e)}")

    def validate_subtitle_file(self, file):
        if file:
            try:
                content = file.read().decode('utf-8', errors='ignore')
                file.seek(0)
                webvtt.from_string(content)
            except Exception:
                raise serializers.ValidationError("Invalid subtitle file format (expected a valid .vtt file).")
        return file
