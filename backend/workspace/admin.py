from django.contrib import admin
from .models import Workspace, Task, PomodoroSession, Whiteboard

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('name', 'user__username')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace', 'completed_at', 'due_date')
    list_filter = ('completed_at', 'workspace')
    search_fields = ('title', 'workspace__name')

@admin.register(PomodoroSession)
class PomodoroAdmin(admin.ModelAdmin):
    list_display = ('user', 'duration', 'completed_at')
    list_filter = ('user',)
    search_fields = ('user__username',)

@admin.register(Whiteboard)
class WhiteboardAdmin(admin.ModelAdmin):
    list_display = ('workspace', 'last_updated')
    search_fields = ('workspace__name',)