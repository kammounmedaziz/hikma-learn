from rest_framework import viewsets, permissions
from .models import Quiz, Question, QuizSubmission
from .serializers import QuizSerializer, QuestionSerializer, QuizStudentSerializer, QuizSubmissionSerializer
from accounts.models import User, UserType
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404

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
        try:
            serializer.save(teacher=self.request.user)
        except ObjectDoesNotExist:
            raise serializers.ValidationError({"teacher": ["Authentication failed, user not found."]})

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]

    def get_queryset(self):
        quiz_id = self.kwargs.get('quiz_pk')
        return Question.objects.filter(quiz_id=quiz_id, quiz__teacher=self.request.user) if quiz_id else Question.objects.none()

    def perform_create(self, serializer):
        quiz = Quiz.objects.get(id=self.kwargs['quiz_pk'], teacher=self.request.user)
        serializer.save(quiz=quiz)

class QuizSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOrTeacherSubmissionAccess]

    def get_quiz(self):
        return get_object_or_404(Quiz, pk=self.kwargs['quiz_pk'])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['quiz'] = self.get_quiz()
        return context

    def get_queryset(self):
        user = self.request.user
        quiz = self.get_quiz()
        submissions = QuizSubmission.objects.filter(quiz=quiz)

        if user.user_type == UserType.STUDENT:
            return submissions.filter(student=user)
        elif user.user_type in [UserType.TEACHER, UserType.ADMIN]:
            return submissions

    def perform_create(self, serializer):
        quiz = Quiz.objects.get(pk=self.kwargs['quiz_pk'])
        serializer.save(student=self.request.user, quiz=quiz)
