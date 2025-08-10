from rest_framework import permissions

class IsWorkspaceOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsTaskOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsPomodoroOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user