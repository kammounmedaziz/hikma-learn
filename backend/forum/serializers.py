from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Comment, Subject, PostAttachment, CommentAttachment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

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
    
    class Meta:
        model = Comment
        fields = '__all__'
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