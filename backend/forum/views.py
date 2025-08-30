from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Question, Answer, Comment, Subject, Notification
from .serializers import (
    QuestionSerializer, AnswerSerializer, 
    CommentSerializer, SubjectSerializer,
    NotificationSerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    queryset = Question.objects.all()  # Add this line
    
    def get_queryset(self):
        queryset = Question.objects.all()
        
        # Filter by subject
        subject = self.request.query_params.get('subject', None)
        if subject:
            queryset = queryset.filter(subject__id=subject)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Search by keyword
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(body__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['get'])
    def answers(self, request, pk=None):
        question = self.get_object()
        answers = question.answers.all()
        serializer = AnswerSerializer(answers, many=True)
        return Response(serializer.data)

class AnswerViewSet(viewsets.ModelViewSet):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    queryset = Answer.objects.all()  # Add this line
    
    def perform_create(self, serializer):
        answer = serializer.save(author=self.request.user)
        
        # Create notification for question author
        if answer.question.author != self.request.user:
            Notification.objects.create(
                user=answer.question.author,
                notification_type='answer',
                message=f"{self.request.user.username} answered your question: {answer.question.title}",
                question=answer.question
            )

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    queryset = Comment.objects.all()  # Add this line
    
    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()
    permission_classes = [permissions.AllowAny]

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})