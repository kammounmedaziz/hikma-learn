from django.urls import path
from .views import register_user,update_disabilities,delete_teacher,update_teacher, login_view, create_teacher_user, list_teachers, change_password
from . import views
urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_view, name='login_user'),
    path('register-teacher/', create_teacher_user),
    path('teachers/', list_teachers, name='list_teachers'),
    path('teachers/<int:pk>/', update_teacher, name='update_teacher'),
    path('teachers/<int:pk>/delete/', delete_teacher, name='delete_teacher'),  # New line
    path('change_password/<int:pk>/', change_password, name='change_password'),
    path('update_disabilities/<int:pk>/', update_disabilities, name='update_disabilities'),
    path('students/', views.list_students, name='list-students'),
    path('students/<int:pk>/', views.update_student, name='update-student'),
    path('students/<int:pk>/delete/', views.delete_student, name='delete-student')
    

]
