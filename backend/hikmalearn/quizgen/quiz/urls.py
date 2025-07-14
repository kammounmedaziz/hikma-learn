from django.urls import path
from .views import generate_quiz
from .views import test_quiz_generation
urlpatterns = [
    path("generate/<int:student_id>/", generate_quiz),
    path("test-quiz/", test_quiz_generation, name="test_quiz"),
]
