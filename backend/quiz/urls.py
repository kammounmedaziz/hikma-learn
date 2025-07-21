from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'quizzes/(?P<quiz_pk>\d+)/questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('', include(router.urls)),
]