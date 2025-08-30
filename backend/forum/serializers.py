from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Question, Answer, Comment, Subject, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['author', 'created_at']

class AnswerSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Answer
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']

class QuestionSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at', 'status']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at']