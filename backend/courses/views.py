from django.shortcuts import render
from rest_framework import viewsets, permissions, serializers
from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.models import UserType
from .models import Course, Chapter, CourseFollow, Content
from .serializers import CourseSerializer, CourseFollowSerializer, ChapterSerializer, ContentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .permissions import IsTeacherOrReadOnly, IsTeacherOfCourse, IsTeacherOfCourseOrReadOnly, IsTeacherOnly, IsStudentOnly, IsTeacherOfChapter

class EmptySerializer(serializers.Serializer):
    pass

# Create your views here.
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-courses', permission_classes=[IsTeacherOnly])
    def my_courses(self, request):
        courses = Course.objects.filter(teacher=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='followed-courses', permission_classes=[IsStudentOnly])
    def student_courses(self, request):
        courses = Course.objects.filter(coursefollow__student=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["get", "post", "delete"],
        permission_classes=[IsStudentOnly],
        serializer_class=EmptySerializer,
        url_path="follow",
    )
    def follow(self, request, pk=None):
        course = self.get_object()
        student = request.user

        if request.method == "GET":
            try:
                follow = CourseFollow.objects.get(student=student, course=course)
                serializer = CourseFollowSerializer(follow, context={"request": request})
                return Response(serializer.data)
            except CourseFollow.DoesNotExist:
                return Response({"detail": "Not following this course."}, status=status.HTTP_404_NOT_FOUND)

        elif request.method == "POST":
            follow, created = CourseFollow.objects.get_or_create(student=student, course=course)
            if not created:
                return Response({"detail": "Already following this course."}, status=status.HTTP_200_OK)
            serializer = CourseFollowSerializer(follow, context={"request": request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        elif request.method == "DELETE":
            deleted, _ = CourseFollow.objects.filter(student=student, course=course).delete()
            if deleted:
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response({"detail": "You are not following this course."}, status=status.HTTP_400_BAD_REQUEST)


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [IsTeacherOfCourseOrReadOnly]

    def get_queryset(self):
        # Filter chapters by the course from the URL and order by 'order'
        course_id = self.kwargs['course_pk']
        return Chapter.objects.filter(course_id=course_id).order_by('order')

    def perform_create(self, serializer):
        # Set the course when creating a new chapter
        course_id = self.kwargs['course_pk']
        serializer.save(course_id=course_id)

    def get_serializer_class(self):
        if self.action == 'reorder':
            from .serializers import ReorderSerializer
            return ReorderSerializer
        return super().get_serializer_class()


    @action(detail=False, methods=['post'], permission_classes=[IsTeacherOfCourse])
    def reorder(self, request, course_pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item_ids = serializer.validated_data['item_ids']
        all_ids = set(self.get_queryset().values_list('id', flat=True))
        submitted_ids = set(item_ids)

        if all_ids != submitted_ids:
            return Response(
                {"detail": "Some chapters are missing or extra."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for order, chapter_id in enumerate(item_ids, start=1):
            Chapter.objects.filter(id=chapter_id).update(order=order)

        return Response(
            {"detail": "Chapters reordered successfully."},
            status=status.HTTP_200_OK,
        )

class ContentViewSet(viewsets.ModelViewSet):
    serializer_class = ContentSerializer
    permission_classes = [IsTeacherOfChapter]

    def get_queryset(self):
        chapter_pk = self.kwargs['chapter_pk']
        return Content.objects.filter(chapter_id=chapter_pk).order_by('order')

    def perform_create(self, serializer):
        chapter_pk = self.kwargs['chapter_pk']
        serializer.save(chapter_id=chapter_pk)

    def get_serializer_class(self):
        if self.action == 'reorder':
            from .serializers import ReorderSerializer
            return ReorderSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=['post'], permission_classes=[IsTeacherOfChapter])
    def reorder(self, request, course_pk=None, chapter_pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item_ids = serializer.validated_data['item_ids']
        all_ids = set(self.get_queryset().values_list('id', flat=True))
        submitted_ids = set(item_ids)
        if all_ids != submitted_ids:
            return Response(
                {"detail": "Some contents are missing or extra."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for order, content_id in enumerate(item_ids, start=1):
            Content.objects.filter(id=content_id).update(order=order)

        return Response({"detail": "Contents reordered successfully."}, status=status.HTTP_200_OK)