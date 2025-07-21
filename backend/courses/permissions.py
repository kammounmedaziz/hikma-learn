
from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import UserType
from .models import Course, Chapter, Content


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

class IsTeacherOfCourse(BasePermission):
    def has_permission(self, request, view):
        course_id = view.kwargs.get('course_pk')
        if course_id is None:
            return False
        try:
            course = Course.objects.get(id=course_id)
            return course.teacher == request.user
        except Course.DoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        return obj.course.teacher == request.user

class IsTeacherOfCourseOrReadOnly(BasePermission):
    """
    Allow any authenticated user to view chapters.
    Only the course's teacher can modify.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        course_id = view.kwargs.get('course_pk')
        if not course_id or not request.user.is_authenticated:
            return False

        try:
            course = Course.objects.get(id=course_id)
            return course.teacher == request.user
        except Course.DoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return obj.course.teacher == request.user

class IsTeacherOfChapter(BasePermission):
    """
    Grants write access **only** to the teacher that owns the course
    to which the chapter belongs.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        chapter_pk = view.kwargs.get('chapter_pk')
        if not chapter_pk or not request.user.is_authenticated:
            return False
        return Chapter.objects.filter(
            id=chapter_pk,
            course__teacher=request.user
        ).exists()

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return obj.chapter.course.teacher == request.user

class IsTeacherOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == UserType.TEACHER

class IsStudentOnly(BasePermission):
    """
    Allows access only to authenticated students.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == UserType.STUDENT