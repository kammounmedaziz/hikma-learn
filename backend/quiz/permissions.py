from accounts.models import UserType
from .models import Quiz
from rest_framework import permissions

class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.user_type == UserType.TEACHER

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if isinstance(obj, Quiz):
            return obj.teacher == request.user
        elif isinstance(obj, Question):
            return obj.quiz.teacher == request.user
        return False

class IsStudentOrTeacherSubmissionAccess(permissions.BasePermission):
    """
    - Students can only create/view their own submissions.
    - Teachers can only view submissions to quizzes they created.
    - Admins can view all submissions.
    """

    def has_permission(self, request, view):
        user = request.user

        if request.method in permissions.SAFE_METHODS:
            if user.user_type in [UserType.STUDENT, UserType.ADMIN]:
                return True

            if user.user_type == UserType.TEACHER:
                quiz_id = view.kwargs.get('quiz_pk')
                if not quiz_id:
                    return False
                try:
                    return Quiz.objects.filter(pk=quiz_id, teacher=user).exists()
                except ValueError:
                    return False

        if request.method == 'POST':
            return user.user_type == UserType.STUDENT

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.user_type == UserType.STUDENT:
            return obj.student == user

        if user.user_type == UserType.TEACHER:
            return obj.quiz.teacher == user

        if user.user_type == UserType.ADMIN:
            return True

        return False