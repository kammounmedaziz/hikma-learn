from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3498db')
    
    def __str__(self):
        return self.name

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title

class PostAttachment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='forum_attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.file_name} ({self.post.title})"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)  # Teacher can pin best answers
    
    class Meta:
        ordering = ['-is_pinned', 'created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

class CommentAttachment(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='comment_attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.file_name} (Comment {self.comment.id})"