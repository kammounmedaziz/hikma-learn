from django.db import models
from django.conf import settings
from django.utils import timezone

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

class Workspace(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('L', 'Low'),
        ('M', 'Medium'),
        ('H', 'High'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='M')
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    xp_earned = models.IntegerField(default=0)
    
    def __str__(self):
        return self.title

    @property
    def status(self):
        return 'Completed' if self.completed_at else 'Pending'
    
    
    def save(self, *args, **kwargs):
        """
        Custom save method to handle XP calculation when completing tasks
        """
        # Only calculate XP when completing a task (not when creating or other updates)
        if self.completed_at and not self._state.adding:
            original = Task.objects.get(pk=self.pk) if self.pk else None
            if original and not original.completed_at and self.completed_at:
                self._calculate_xp()
        super().save(*args, **kwargs)
        
        
    def _calculate_xp(self):
        """Calculate XP based on priority and timeliness"""
        base_xp = 5
        priority_bonus = {
            'H': 3,
            'M': 1,
            'L': 0
        }.get(self.priority, 0)
        
        timeliness_bonus = 7 if (
            self.due_date and 
            self.completed_at <= self.due_date
        ) else 0
        
        self.xp_earned = base_xp + priority_bonus + timeliness_bonus
        return self.xp_earned

class PomodoroSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workspace = models.ForeignKey(Workspace, on_delete=models.SET_NULL, null=True, blank=True)
    duration = models.IntegerField()  # in minutes
    completed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.duration}min session by {self.user.username}"

class Whiteboard(models.Model):
    workspace = models.OneToOneField(Workspace, on_delete=models.CASCADE)
    data = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Whiteboard for {self.workspace.name}"

class Badge(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=100)  # URL or icon class
    xp_threshold = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'badge')
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak_days = models.IntegerField(default=0)
    last_login_date = models.DateField(auto_now_add=True)
    tasks_completed_total = models.IntegerField(default=0)
    focus_minutes_total = models.IntegerField(default=0)
    focus_sessions_count = models.IntegerField(default=0)
    daily_goal = models.IntegerField(default=5)
    related_name='profile'
    
    def __str__(self):
         return f"Profile of {self.user.username}"