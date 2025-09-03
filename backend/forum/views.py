<<<<<<< HEAD
# forum/views.py
from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from .models import Post, Comment, Subject, PostAttachment, CommentAttachment
from .serializers import PostSerializer, CommentSerializer, SubjectSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly


# ✅ Base authenticated API view (like in workspace)
class AuthenticatedAPIView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]


# ✅ Simple profile endpoint (optional)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "user_type": getattr(user, "user_type", None),  # Safe
    })


# ✅ Custom permissions
=======
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

>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

<<<<<<< HEAD

class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(request.user, "user_type", None) == "teacher"


# ✅ Post ViewSet
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.all()
        subject = self.request.query_params.get("subject")
        search = self.request.query_params.get("search")

        if subject:
            queryset = queryset.filter(subject__id=subject)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)

        # Handle file attachments
        files = self.request.FILES.getlist("attachments")
        for file in files:
            PostAttachment.objects.create(
                post=post,
                file=file,
                file_name=file.name,
                file_type=file.content_type
            )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsTeacherOrReadOnly])
    def pin(self, request, pk=None):
        post = self.get_object()
        post.is_pinned = not post.is_pinned
        post.save()
        return Response({"status": "pinned" if post.is_pinned else "unpinned"})


# ✅ Comment ViewSet
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)

        # Handle file attachments
        files = self.request.FILES.getlist("attachments")
        for file in files:
            CommentAttachment.objects.create(
                comment=comment,
                file=file,
                file_name=file.name,
                file_type=file.content_type
            )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsTeacherOrReadOnly])
    def pin(self, request, pk=None):
        comment = self.get_object()

        # Unpin other comments on the same post
        Comment.objects.filter(post=comment.post, is_pinned=True).update(is_pinned=False)

        comment.is_pinned = not comment.is_pinned
        comment.save()
        return Response({"status": "pinned" if comment.is_pinned else "unpinned"})


# ✅ Subject ViewSet (read only, public)
=======
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

>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()
    permission_classes = [permissions.AllowAny]

<<<<<<< HEAD

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forum_workspace(request):
    user = request.user
    posts = Post.objects.all()
    subjects = Subject.objects.all()
    posts_data = PostSerializer(posts, many=True).data
    subjects_data = SubjectSerializer(subjects, many=True).data

    return Response({
        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_type": getattr(user, 'user_type', ''),
        },
        "posts": posts_data,
        "subjects": subjects_data,
    })
=======
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
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
