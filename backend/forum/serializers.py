from rest_framework import serializers
from django.contrib.auth import get_user_model
<<<<<<< HEAD
from .models import Post, Comment, Subject, PostAttachment, CommentAttachment
=======
from .models import Question, Answer, Comment, Subject, Notification
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
<<<<<<< HEAD
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type']
=======
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

<<<<<<< HEAD
class PostAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostAttachment
        fields = ['id', 'file', 'file_name', 'file_type', 'uploaded_at']

class CommentAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentAttachment
        fields = ['id', 'file', 'file_name', 'file_type', 'uploaded_at']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    attachments = CommentAttachmentSerializer(many=True, read_only=True)
=======
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
    
    class Meta:
        model = Comment
        fields = '__all__'
<<<<<<< HEAD
        read_only_fields = ['author', 'created_at', 'updated_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    attachments = PostAttachmentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_comments_count(self, obj):
        return obj.comments.count()
=======
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
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
