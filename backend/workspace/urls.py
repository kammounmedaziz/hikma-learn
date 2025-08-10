from django.urls import path
from . import views
from .views import profile, TaskDetailView

urlpatterns = [
    path('workspaces/', views.WorkspaceListCreateView.as_view(), name='workspace-list'),
    path('workspaces/<int:pk>/', views.WorkspaceDetailView.as_view(), name='workspace-detail'),
    path('workspace/tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('pomodoro/', views.PomodoroSessionView.as_view(), name='pomodoro-list'),
    path('whiteboards/<int:workspace_id>/', views.WhiteboardDetailView.as_view(), name='whiteboard-detail'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('focus/', views.FocusSessionView.as_view(), name='focus-session'),
    path('badges/', views.BadgeListView.as_view(), name='badge-list'),
    path('profile/', profile, name='profile'),
]