
from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import UserType


class IsTeacherOrReadOnly(BasePermission):
    """
    Teachers can create and edit their own courses. Students and admins can only view.
    """
    def has_permission(self, request, view):
        user = request.user
        if request.method in SAFE_METHODS:
            return user.is_authenticated
        return user.is_authenticated and user.user_type == UserType.TEACHER

    def has_object_permission(self, request, view, obj):
        # Allow safe methods for any authenticated user
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        # Only the owner (teacher) can modify their course
        return obj.teacher == request.user


class IsTeacherOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == UserType.TEACHER

class IsStudentOnly(BasePermission):
    """
    Allows access only to authenticated students.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == UserType.STUDENT