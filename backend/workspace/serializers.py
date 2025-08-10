from rest_framework import serializers
from .models import *

class TaskSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'xp_earned')  # Removed completed_at from read_only
    
    def get_status(self, obj):
        if obj.completed_at:
            return 'completed'
        elif obj.due_date and obj.due_date < timezone.now():
            return 'overdue'
        return 'active'
    
    def update(self, instance, validated_data):
        """
        Custom update to handle completion status and XP calculation
        """
        completed_at = validated_data.get('completed_at')
        
        # Only calculate XP if changing from incomplete to complete
        if completed_at is not None and not instance.completed_at and completed_at:
            instance._calculate_xp()
        
        # If uncompleting a task, reset XP
        if completed_at is None and instance.completed_at:
            instance.xp_earned = 0
        
        return super().update(instance, validated_data)

class WorkspaceSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'user', 'created_at', 'tasks']
        read_only_fields = ['user', 'created_at']

class PomodoroSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSession
        fields = ['id', 'user', 'workspace', 'duration', 'completed_at']
        read_only_fields = ['user', 'completed_at']

class WhiteboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Whiteboard
        fields = ['id', 'workspace', 'data', 'last_updated']
        read_only_fields = ['last_updated']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'xp', 'level', 'streak_days', 'last_login_date', 
                          'tasks_completed_total', 'focus_minutes_total', 'focus_sessions_count')
    
    def get_badges(self, obj):
        badges = UserBadge.objects.filter(user=obj.user)
        return UserBadgeSerializer(badges, many=True).data

class StatsSerializer(serializers.ModelSerializer):
    xp_needed = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['xp', 'level', 'streak_days', 'tasks_completed_total', 
                 'focus_minutes_total', 'xp_needed', 'progress']
    
    def get_xp_needed(self, obj):
        return obj.level * 1000
    
    def get_progress(self, obj):
        return (obj.xp / (obj.level * 1000)) * 100