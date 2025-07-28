# quiz/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r'', QuizViewSet, basename='quiz')  # Now: /quizzes/
router.register(r'(?P<quiz_pk>\d+)/questions', QuestionViewSet, basename='question')  # /quizzes/1/questions/

urlpatterns = [
    path('', include(router.urls)),
]

