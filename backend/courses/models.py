from django.db import models

from accounts.models import User, UserType

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    cover_photo = models.ImageField(upload_to='course_photos/', blank=True, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    teacher = models.ForeignKey(User, limit_choices_to={'user_type': UserType.TEACHER}, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class CourseFollow(models.Model):
    student = models.ForeignKey(User, limit_choices_to={'user_type': UserType.STUDENT}, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    follow_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

class Chapter(models.Model):
    course = models.ForeignKey(Course, related_name='chapters', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=1)
    creation_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ContentKind(models.TextChoices):
    FILE = 'FILE', 'File'
    TEXT = 'TEXT', 'Text'
    LINK = 'LINK', 'Link'
    QUIZ = 'QUIZ', 'Quiz'

class FileKind(models.TextChoices):
    PDF = 'PDF', 'PDF Document'
    IMAGE = 'IMAGE', 'Image'
    VIDEO = 'VIDEO', 'Video'
    AUDIO = 'AUDIO', 'Audio'
    ARCHIVE = 'ARCHIVE', 'Archive (ZIP, RAR)'
    DOCUMENT = 'DOCUMENT', 'Word Document'
    SLIDE = 'SLIDE', 'Presentation (PPT)'
    SPREADSHEET = 'SPREADSHEET', 'Spreadsheet (Excel, CSV)'
    OTHER = 'OTHER', 'Other'

class Content(models.Model):
    chapter = models.ForeignKey(Chapter, related_name='contents', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    content_kind = models.CharField(max_length=20, choices=ContentKind.choices, default=ContentKind.FILE)
    file = models.FileField(upload_to='content_files/', blank=True, null=True)
    file_kind = models.CharField(max_length=20, choices=FileKind.choices, blank=True, null=True)
    file_mime_type = models.CharField(max_length=100, blank=True, null=True)  # Optional MIME type for the file
    text = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=1)
    creation_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def clean(self):
        if self.content_kind == ContentKind.LINK and not self.url:
            raise ValidationError("URL must be provided for LINK content type.")
        if self.content_kind == ContentKind.FILE and not self.file:
            raise ValidationError("File must be provided for FILE content type.")
        if self.content_kind == ContentKind.FILE and not self.file_kind:
            raise ValidationError("File type must be specified for FILE content type.")
        if self.content_kind == ContentKind.TEXT and not self.text:
            raise ValidationError("Text must be provided for TEXT content type.")
        if self.content_kind == ContentKind.QUIZ and not hasattr(self, 'quiz'):
            raise ValidationError("Quiz must be associated with QUIZ content type.")
        if self.content_kind == ContentKind.QUIZ and (self.file or self.url or self.text):
            raise ValidationError("Quiz content type should not have file, URL, or text fields filled.")

# Incomplete Quiz model
class Quiz(models.Model):
    content = models.OneToOneField(Content, related_name='quiz', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    # TODO: Complete quiz model

class ContentSeen(models.Model):
    student = models.ForeignKey(User, limit_choices_to={'user_type': UserType.STUDENT}, on_delete=models.CASCADE)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    seen_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'content')

# Signal to auto-increment order
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

@receiver(pre_save, sender=Chapter)
def auto_set_chapter_order(sender, instance, *args, **kwargs):
    if instance.pk is None:
        max_order = sender.objects.filter(course=instance.course).aggregate(models.Max('order'))['order__max']
        instance.order = (max_order or 0) + 1

@receiver(pre_save, sender=Content)
def auto_set_content_order(sender, instance, *args, **kwargs):
    if instance.pk is None:
        max_order = sender.objects.filter(chapter=instance.chapter).aggregate(models.Max('order'))['order__max']
        instance.order = (max_order or 0) + 1