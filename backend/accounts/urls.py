from django.urls import path
from .views import register_user, login_view, create_teacher_user, list_teachers

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_view, name='login_user'),
    path('register-teacher/', create_teacher_user),
    path('teachers/', list_teachers, name='list_teachers'),
]
