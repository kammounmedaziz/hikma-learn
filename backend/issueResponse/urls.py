from django.urls import path
from .views import (
    IssueCreateView,
    IssueListView,
    IssueDetailView,
    IssueStatusUpdateView
)

urlpatterns = [
    path('issues/', IssueListView.as_view(), name='issue-list'),
    path('issues/create/', IssueCreateView.as_view(), name='issue-create'),
    path('issues/<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('issues/<int:pk>/update-status/', IssueStatusUpdateView.as_view(), name='issue-update-status'),
]
