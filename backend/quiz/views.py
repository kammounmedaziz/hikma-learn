from rest_framework import viewsets, permissions, serializers
from .permissions import IsTeacherOrReadOnly, IsStudentOrTeacherSubmissionAccess
from .models import Quiz, Question, QuizSubmission
from .serializers import QuizSerializer, QuestionSerializer, QuizSubmissionSerializer
from accounts.models import User, UserType
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404

class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
    serializer_class = QuizSerializer

    def get_queryset(self):
        if self.request.user.user_type == UserType.TEACHER:
            return Quiz.objects.filter(teacher=self.request.user)
        return Quiz.objects


    def perform_create(self, serializer):
        try:
            serializer.save(teacher=self.request.user)
        except ObjectDoesNotExist:
            raise serializers.ValidationError({"teacher": ["Authentication failed, user not found."]})

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
