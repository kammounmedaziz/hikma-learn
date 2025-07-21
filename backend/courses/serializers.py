from rest_framework import serializers
from .models import Course, CourseFollow, Chapter, Content, ContentKind, Quiz
from rest_framework.reverse import reverse

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

    class Meta:
        model = Content
        fields = [
            'id', 'content_url', 'title', 'content_kind',
            'url', 'file', 'file_kind', 'file_mime_type',
            'text',
            'order', 'creation_date', 'updated_date'
        ]
        read_only_fields = ['order', 'file_mime_type', 'file_kind', 'creation_date', 'updated_date']

    def get_content_url(self, obj):
        request = self.context.get('request')
        return reverse('content-detail', kwargs={'course_pk': obj.chapter.course_id, 'chapter_pk': obj.chapter_id, 'pk': obj.pk}, request=request)

    def validate(self, attrs):
        kind = attrs.get('content_kind', self.instance and self.instance.content_kind)

        def get_field_value(field):
            # Return the new value if provided, else fallback to instance's existing value (if any)
            if field in attrs:
                return attrs[field]
            if self.instance:
                return getattr(self.instance, field, None)
            return None

        if kind == ContentKind.FILE:
            file_val = get_field_value('file')
            if not file_val:
                raise serializers.ValidationError({'file': 'This field is required for FILE content.'})

        elif kind == ContentKind.LINK:
            url_val = get_field_value('url')
            if not url_val:
                raise serializers.ValidationError({'url': 'This field is required for LINK content.'})

        elif kind == ContentKind.TEXT:
            text_val = get_field_value('text')
            if not text_val or not text_val.strip():
                raise serializers.ValidationError({'text': 'This field is required for TEXT content.'})

        if kind != ContentKind.TEXT and get_field_value('text'):
            raise serializers.ValidationError({'text': 'Text field should only be filled for TEXT content type.'})
        if kind != ContentKind.LINK and get_field_value('url'):
            raise serializers.ValidationError({'url': 'URL field should only be filled for LINK content type.'})
        if kind != ContentKind.FILE:
            if get_field_value('file'):
                raise serializers.ValidationError({'file': 'File field should only be filled for FILE content type.'})
        quiz_val = attrs.get('quiz') or (getattr(self.instance, 'quiz', None) if self.instance else None)
        if kind != ContentKind.QUIZ and quiz_val:
            raise serializers.ValidationError({'quiz': 'Quiz field should only be filled for QUIZ content type.'})

        return attrs