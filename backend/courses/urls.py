from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import CourseViewSet, ChapterViewSet, ContentViewSet, MarkContentViewed
from .views import embedded_pdf_view

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
    path('pdf/embed/<int:content_id>/', embedded_pdf_view, name='embed_pdf'),
    path('courses/<int:course_pk>/chapters/<int:chapter_pk>/contents/<int:pk>/view/', MarkContentViewed.as_view(), name='mark-content-viewed'),
]