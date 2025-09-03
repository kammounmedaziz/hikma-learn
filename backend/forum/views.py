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
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


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
class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()
    permission_classes = [permissions.AllowAny]


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
