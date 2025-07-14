from django.urls import path
from .views import register_user, login_view

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_view, name='login_user'),
]