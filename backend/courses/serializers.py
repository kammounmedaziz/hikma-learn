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
        if kind == ContentKind.FILE:
            if not attrs.get('file'):
                raise serializers.ValidationError({'file': 'This field is required for FILE content.'})
        elif kind == ContentKind.LINK and not attrs.get('url'):
            raise serializers.ValidationError({'url': 'This field is required for LINK content.'})
        elif kind == ContentKind.TEXT and not attrs.get('text', '').strip():
            raise serializers.ValidationError({'text': 'This field is required for TEXT content.'})
        return attrs