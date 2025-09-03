from django.db import models
from django.contrib.auth import get_user_model

<<<<<<< HEAD
User = get_user_model()

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3498db')
=======
# User model (will be customized later if needed)
User = get_user_model()

# Enum for user types
class UserType(models.TextChoices):
    TEACHER = 'teacher', 'Teacher'
    ADMIN = 'admin', 'Admin'
    STUDENT = 'student', 'Student'

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
    
    def __str__(self):
        return self.name

<<<<<<< HEAD
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
=======
class Question(models.Model):
    STATUS_CHOICES = [
        ('answered', 'Answered'),
        ('unanswered', 'Unanswered'),
    ]
    
    title = models.CharField(max_length=255)
    body = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_questions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unanswered')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def update_status(self):
        # Automatically update status based on answers
        if self.answers.filter(pinned=True).exists():
            self.status = 'answered'
        else:
            self.status = 'unanswered'
        self.save()

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_answers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pinned = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-pinned', 'created_at']
    
    def __str__(self):
        return f"Answer to: {self.question.title}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update question status when an answer is saved
        self.question.update_status()
    
    def delete(self, *args, **kwargs):
        question = self.question
        super().delete(*args, **kwargs)
        # Update question status when an answer is deleted
        question.update_status()

class Comment(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('question', 'Question'),
        ('answer', 'Answer'),
    ]
    
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPE_CHOICES)
    object_id = models.PositiveIntegerField()
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_comments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('answer', 'New Answer'),
        ('comment', 'New Comment'),
        ('pinned', 'Answer Pinned'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_notifications')
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
