from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.models import UserType
from .models import Course
from .serializers import CourseSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .permissions import IsTeacherOrReadOnly, IsTeacherOnly

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
