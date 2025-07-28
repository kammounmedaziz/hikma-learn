# quiz/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, QuizSubmissionViewSet

router = DefaultRouter()
router.register(r'', QuizViewSet, basename='quiz')  # Now: /quizzes/
router.register(r'(?P<quiz_pk>\d+)/questions', QuestionViewSet, basename='question')  # /quizzes/1/questions/

router.register(r'(?P<quiz_pk>\d+)/submissions', QuizSubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]

