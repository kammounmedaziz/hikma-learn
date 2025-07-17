from django.urls import path
from .views import register_user,delete_teacher,update_teacher, login_view, create_teacher_user, list_teachers, change_password

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_view, name='login_user'),
    path('register-teacher/', create_teacher_user),
    path('teachers/', list_teachers, name='list_teachers'),
    path('teachers/<int:pk>/', update_teacher, name='update_teacher'),
    path('teachers/<int:pk>/delete/', delete_teacher, name='delete_teacher'),  # New line
    path('change_password/<int:pk>/', change_password, name='change_password'),



    

]
