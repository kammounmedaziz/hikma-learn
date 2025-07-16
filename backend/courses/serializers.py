from rest_framework import serializers
from .models import Course, CourseFollow, Chapter, Content, Quiz

class CourseSerializer(serializers.ModelSerializer):
    teacher = serializers.ReadOnlyField(source='teacher.username')
    class Meta:
        model = Course
        fields = ['id', 'url', 'title', 'description', 'cover_photo', 'creation_date', 'updated_date', 'teacher']

class CourseFollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFollow
        fields = ['id', 'student', 'course', 'follow_date']
        read_only_fields = ['id', 'student', 'follow_date']