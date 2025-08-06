import webvtt
from django.db.models import QuerySet
from rest_framework import serializers
from .models import Course, CourseFollow, Chapter, Content, ContentKind, Quiz
from rest_framework.reverse import reverse
from django.core.exceptions import ValidationError
import re

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
    subtitle_file_url = serializers.SerializerMethodField()
    image_alt_text = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Content
        fields = [
            'id', 'content_url', 'title', 'content_kind',
            'url', 'file', 'file_kind', 'file_mime_type',
            'text', 'order', 'subtitle_file', 'subtitle_file_url', 
            'transcript_text', 'image_alt_text', 'creation_date', 'updated_date'
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
                content = obj.subtitle_file.read().decode('utf-8')
                buffer = StringIO(content)
                vtt = webvtt.read_buffer(buffer)
                return ' '.join([cue.text.strip() for cue in vtt])
            except Exception:
                return ''
        return ''

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        if request and request.method == 'GET':
            if isinstance(getattr(self, 'instance', None), QuerySet):
                fields.pop('subtitle_file', None)
            else:
                instance = getattr(self, 'instance', None)
                if instance and (instance.content_kind != ContentKind.FILE or not getattr(instance, 'file_mime_type', '').startswith('video/')):
                    fields.pop('subtitle_file', None)
        return fields

    def get_subtitle_file_url(self, obj):
        request = self.context.get('request')
        if obj.subtitle_file and hasattr(obj.subtitle_file, 'url'):
            return request.build_absolute_uri(obj.subtitle_file.url) if request else obj.subtitle_file.url
        return None

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
                raise serializers.ValidationError({'file': 'This field is required for FILE content.'})

        elif kind == ContentKind.LINK:
            url_val = get_field_value('url')
            if not url_val:
                errors['url'] = 'This field is required for LINK content.'

        elif kind == ContentKind.TEXT:
            text_val = get_field_value('text')
            if not text_val or not text_val.strip():
                errors['text'] = 'This field is required for TEXT content.'

        if kind != ContentKind.TEXT and get_field_value('text'):
            errors['text'] = 'Text field should only be filled for TEXT content type.'
        if kind != ContentKind.LINK and get_field_value('url'):
            errors['url'] = 'URL field should only be filled for LINK content type.'
        if kind != ContentKind.FILE and get_field_value('file'):
            errors['file'] = 'File field should only be filled for FILE content type.'
        quiz_val = attrs.get('quiz') or (getattr(self.instance, 'quiz', None) if self.instance else None)
        if kind != ContentKind.QUIZ and quiz_val:
            errors['quiz'] = 'Quiz field should only be filled for QUIZ content type.'

        # Validate image_alt_text
        image_alt_text = attrs.get('image_alt_text', None)
        if image_alt_text == '':
            attrs['image_alt_text'] = None
        if image_alt_text and kind == ContentKind.FILE:
            file_mime_type = None
            file_val = get_field_value('file')
            if file_val and hasattr(file_val, 'content_type'):
                file_mime_type = file_val.content_type
            elif self.instance and self.instance.file_mime_type:
                file_mime_type = self.instance.file_mime_type

            if file_mime_type and not file_mime_type.startswith('image/'):
                errors['image_alt_text'] = 'Image alt text should only be provided for image files.'

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def update(self, instance, validated_data):
        # Protéger file_kind et file_mime_type contre les modifications
        validated_data.pop('file_kind', None)
        validated_data.pop('file_mime_type', None)
        return super().update(instance, validated_data)

    def validate_subtitle_file(self, file):
        if file:
            try:
                content = file.read().decode('utf-8', errors='ignore')
                file.seek(0)
                webvtt.from_string(content)
            except Exception:
                raise serializers.ValidationError("Invalid subtitle file format (expected a valid .vtt file).")
        return file

class SubtitleEditSerializer(serializers.Serializer):
    subtitle_content = serializers.CharField()

    def validate_subtitle_content(self, value):
        try:
            webvtt.from_string(value)
        except Exception:
            raise serializers.ValidationError("Invalid .vtt subtitle file format.")
        return value