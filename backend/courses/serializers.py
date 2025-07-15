from rest_framework import serializers
from .models import Course, Chapter, Content, Quiz

class CourseSerializer(serializers.ModelSerializer):
    teacher = serializers.ReadOnlyField(source='teacher.username')
    class Meta:
        model = Course
        fields = ['id', 'url', 'title', 'description', 'cover_photo', 'creation_date', 'updated_date', 'teacher']