from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
<<<<<<< HEAD
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'subjects', views.SubjectViewSet, basename='subject')


urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.profile, name='profile'),
    path('workspace/', views.forum_workspace, name='forum_workspace'),  # Add this line
    path('api-auth/', include('rest_framework.urls')),
=======
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'answers', views.AnswerViewSet, basename='answer')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
]