from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import CourseViewSet, ChapterViewSet, ContentViewSet

# Main router for courses
router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

# Nested router for chapters under courses
course_router = NestedSimpleRouter(router, r'courses', lookup='course')
course_router.register(r'chapters', ChapterViewSet, basename='chapter')

# Nested router for contents under chapters
chapter_router = NestedSimpleRouter(course_router, r'chapters', lookup='chapter')
chapter_router.register(r'contents', ContentViewSet, basename='content')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(course_router.urls)),
    path('', include(chapter_router.urls)),
]