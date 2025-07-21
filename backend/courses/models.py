from django.db import models

from accounts.models import User, UserType

from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.db.models.signals import post_delete
from django.dispatch import receiver


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

MIME_TO_FILEKIND_MAP = {
    'application/pdf': FileKind.PDF,
    'image/': FileKind.IMAGE,
    'video/': FileKind.VIDEO,
    'audio/': FileKind.AUDIO,
    'application/zip': FileKind.ARCHIVE,
    'application/x-rar-compressed': FileKind.ARCHIVE,
    'application/msword': FileKind.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileKind.DOCUMENT,
    'application/vnd.ms-powerpoint': FileKind.SLIDE,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileKind.SLIDE,
    'application/vnd.ms-excel': FileKind.SPREADSHEET,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileKind.SPREADSHEET,
    'text/csv': FileKind.SPREADSHEET,
}

def guess_file_kind(mime_type: str) -> str:
    if not mime_type:
        return FileKind.OTHER
    for pattern, kind in MIME_TO_FILEKIND_MAP.items():
        if mime_type.startswith(pattern):
            return kind
    # Return OTHER if no pattern matches
    return FileKind.OTHER

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
        if self.content_kind == ContentKind.FILE:
            if not self.file:
                raise ValidationError("File must be provided for FILE content type.")
            elif self.file.size == 0:
                raise ValidationError("File cannot be empty.")
        elif self.content_kind == ContentKind.LINK:
            if not self.url:
                raise ValidationError("URL must be provided for LINK content type.")
        elif self.content_kind == ContentKind.TEXT:
            if not self.text:
                raise ValidationError("Text must be provided for TEXT content type.")
        elif self.content_kind == ContentKind.QUIZ:
            if not getattr(self, 'quiz', None):
                raise ValidationError("Quiz must be associated with QUIZ content type.")
        else:
            raise ValidationError("Invalid content kind specified.")

        if self.content_kind != ContentKind.TEXT and self.text:
            raise ValidationError("Text field should only be filled for TEXT content type.")
        if self.content_kind != ContentKind.LINK and self.url:
            raise ValidationError("URL field should only be filled for LINK content type.")
        if self.content_kind != ContentKind.QUIZ and getattr(self, 'quiz', None):
            raise ValidationError("Quiz field should only be filled for QUIZ content type.")
        if self.content_kind != ContentKind.FILE:
            if self.file:
                raise ValidationError("File field should only be filled for FILE content type.")
            if self.file_kind:
                raise ValidationError("File kind should only be filled for FILE content type.")
            if self.file_mime_type:
                raise ValidationError("File MIME type should only be filled for FILE content type.")

    def save(self, *args, **kwargs):
        is_file_content = self.content_kind == ContentKind.FILE and self.file

        if is_file_content:
            # Use untrusted browser MIME
            self.file_mime_type = getattr(self.file.file, 'content_type', None) or 'application/octet-stream'

            # Guess file kind based on MIME type
            self.file_kind = guess_file_kind(self.file_mime_type)

        super().save(*args, **kwargs)


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

@receiver(post_delete, sender=Chapter)
def reorder_chapters_after_delete(sender, instance, **kwargs):
    chapters = Chapter.objects.filter(course=instance.course).order_by('order')
    for idx, chapter in enumerate(chapters, start=1):
        if chapter.order != idx:
            chapter.order = idx
            chapter.save(update_fields=["order"])

@receiver(post_delete, sender=Content)
def reorder_contents_after_delete(sender, instance, **kwargs):
    contents = Content.objects.filter(chapter=instance.chapter).order_by('order')
    for idx, content in enumerate(contents, start=1):
        if content.order != idx:
            content.order = idx
            content.save(update_fields=["order"])
