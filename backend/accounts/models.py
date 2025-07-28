from django.db import models

from django.contrib.auth.models import AbstractUser
from django.forms import ValidationError

# Enum for user types
class UserType(models.TextChoices):
    TEACHER = 'teacher', 'Teacher'
    ADMIN = 'admin', 'Admin'
    STUDENT = 'student', 'Student'

# Single User model with discriminator and optional fields
class User(AbstractUser):
    cin = models.CharField(max_length=20, unique=True, null=True, blank=True)
    user_type = models.CharField(max_length=10, choices=UserType.choices)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)  # Use ImageField for profile photos
    phone_num = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    # Student fields
    disabilities = models.JSONField(default=list, blank=True, null=True)
    # Teacher fields
    fields = models.JSONField(default=list, blank=True, null=True)

    def clean(self):
        # Ensure disabilities is reserved for students only
        if self.user_type != UserType.STUDENT and self.disabilities is not None and self.disabilities:
            raise ValidationError("The disabilities field can only be set for students.")

        # Ensure fields are reserved for teachers only
        if self.user_type != UserType.TEACHER and self.fields is not None and self.fields:
            raise ValidationError("The fields field can only be set for teachers.")

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.user_type = UserType.ADMIN
            self.is_staff = True
        elif self.user_type == UserType.ADMIN:
            self.is_superuser = True
            self.is_staff = True
        super().save(*args, **kwargs)
