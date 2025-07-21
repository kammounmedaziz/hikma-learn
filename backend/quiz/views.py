from rest_framework import viewsets, permissions
from .models import Quiz, Question
from .serializers import QuizSerializer, QuestionSerializer, QuizStudentSerializer
from accounts.models import User, UserType

class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # Allow read-only access (GET, HEAD, OPTIONS) for all authenticated users
        return request.user.user_type == UserType.TEACHER

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True  # Allow read-only access to objects
        if isinstance(obj, Quiz):
            return obj.teacher == request.user
        elif isinstance(obj, Question):
            return obj.quiz.teacher == request.user
        return False

class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]

    def get_queryset(self):
        if self.request.user.user_type == UserType.TEACHER:
            return Quiz.objects.filter(teacher=self.request.user)
        return Quiz.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.request.user.user_type == UserType.TEACHER:
            return QuizSerializer
        return QuizStudentSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]

    def get_queryset(self):
        quiz_id = self.kwargs.get('quiz_pk')
        return Question.objects.filter(quiz_id=quiz_id, quiz__teacher=self.request.user) if quiz_id else Question.objects.none()

    def perform_create(self, serializer):
        quiz = Quiz.objects.get(id=self.kwargs['quiz_pk'], teacher=self.request.user)
        serializer.save(quiz=quiz)