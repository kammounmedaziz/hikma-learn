from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# Simple profile endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'user_type': getattr(user, 'user_type', None),  # Use getattr for safety
        # Add other user fields as needed
    })
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import *
from .serializers import *
from .permissions import IsWorkspaceOwner, IsTaskOwner


# Base view class with common authentication settings
class AuthenticatedAPIView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class WorkspaceListCreateView(AuthenticatedAPIView, generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkspaceDetailView(AuthenticatedAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]
    queryset = Workspace.objects.all()


class TaskListCreateView(AuthenticatedAPIView, generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        from django.db import IntegrityError
        from workspace.models import UserProfile  # Import your UserProfile model
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            with transaction.atomic():
                user = self.request.user
                
                # Get or create user profile if it doesn't exist
                profile, created = UserProfile.objects.get_or_create(user=user)
                if created:
                    logger.info(f"Created new profile for user {user.username}")
                
                # Create and save the task
                task = serializer.save(user=user)
                
                # Update profile and task
                profile.xp += 1
                profile.save()
                task.xp_earned += 1
                task.save()
                
                logger.info(f"Task created: {task} for user {user.username}")
                
        except IntegrityError as e:
            logger.error(f"IntegrityError during task creation: {e}")
            raise serializers.ValidationError("Database error occurred")
        except Exception as e:
            logger.error(f"Error during task creation: {e}")
            raise serializers.ValidationError(str(e))


class TaskDetailView(AuthenticatedAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsTaskOwner]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        print(f"Received update for task {self.get_object().id}")  # Debug
        print(f"Request data: {self.request.data}")  # Debug
        
        try:
            with transaction.atomic():
                task = self.get_object()
                print(f"Current state - completed: {task.completed_at}, due: {task.due_date}, xp: {task.xp_earned}")  # Debug
                
                # Handle completion status change first
                completed_at = serializer.validated_data.get('completed_at')
                if completed_at is not None:
                    if completed_at and not task.completed_at:
                        print("Marking task as completed")
                        task.completed_at = completed_at
                        xp_earned = self._award_task_completion(task)
                        task.xp_earned = xp_earned
                        task.save()
                        print(f"Awarded {xp_earned} XP")
                    elif not completed_at and task.completed_at:
                        print("Marking task as incomplete")
                        self._remove_task_completion(task)
                
                # Update other fields
                for field, value in serializer.validated_data.items():
                    if field != 'completed_at':  # Already handled
                        setattr(task, field, value)
                
                task.save()
                return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)
                
        except Exception as e:
            print(f"Update failed: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _award_task_completion(self, task):
        """Safe XP calculation with null checks and profile updates"""
        try:
            profile = task.user.profile
            base_xp = 5
            
            # Priority bonus
            priority_bonus = {
                'H': 3,
                'M': 1,
                'L': 0
            }.get(task.priority, 0)
            
            # Timeliness bonus (only if both dates exist)
            timeliness_bonus = 0
            if task.due_date and task.completed_at:
                try:
                    timeliness_bonus = 7 if (task.completed_at <= task.due_date) else 0
                except TypeError as e:
                    print(f"Date comparison error: {e}")
                    timeliness_bonus = 0
            
            total_xp = base_xp + priority_bonus + timeliness_bonus
            
            # Update profile
            profile.xp += total_xp
            profile.tasks_completed_total += 1
            profile.save()
            
            # Check for level up and badges
            self._check_level_up(profile)
            self._check_badges(profile)
            
            return total_xp
            
        except Exception as e:
            print(f"Error in XP calculation: {e}")
            return 5  # Minimum XP fallback

    def _remove_task_completion(self, task):
        """Handle task un-completion"""
        try:
            profile = task.user.profile
            if task.xp_earned > 0:
                profile.xp -= task.xp_earned
                profile.tasks_completed_total -= 1
                profile.save()
            task.xp_earned = 0
            task.completed_at = None
            task.save()
        except Exception as e:
            print(f"Error removing completion: {e}")

    def _check_level_up(self, profile):
        """Check if user leveled up"""
        xp_needed = profile.level * 1000
        if profile.xp >= xp_needed:
            profile.level += 1
            profile.save()

    def _check_badges(self, profile):
        """Check and award badges"""
        try:
            if profile.tasks_completed_total >= 50:
                self._award_badge(profile, 'task_finisher')
            
            today_tasks = Task.objects.filter(
                user=profile.user,
                completed_at__date=timezone.now().date()
            ).count()
            if today_tasks >= profile.daily_goal:
                profile.xp += 10
                profile.save()
                
                if profile.streak_days >= 3:
                    self._award_badge(profile, 'streak_starter')
        except Exception as e:
            print(f"Error checking badges: {e}")

    def _award_badge(self, profile, badge_name):
        """Award a badge to user"""
        try:
            badge = Badge.objects.get(name=badge_name)
            UserBadge.objects.get_or_create(user=profile.user, badge=badge)
        except Exception as e:
            print(f"Error awarding badge: {e}")


class PomodoroSessionView(AuthenticatedAPIView, generics.ListCreateAPIView):
    serializer_class = PomodoroSerializer

    def get_queryset(self):
        return PomodoroSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            session = serializer.save(user=self.request.user)
            from .models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
            profile.xp += session.duration
            profile.focus_minutes_total += session.duration
            profile.focus_sessions_count += 1
            profile.save()
            
            if profile.focus_sessions_count >= 10:
                badge = Badge.objects.get(name='zen_focus')
                UserBadge.objects.get_or_create(user=self.request.user, badge=badge)
            
            return Response({'xp_earned': session.duration}, status=status.HTTP_201_CREATED)


class WhiteboardDetailView(AuthenticatedAPIView, generics.RetrieveUpdateAPIView):
    serializer_class = WhiteboardSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]
    queryset = Whiteboard.objects.all()
    lookup_field = 'workspace_id'
    lookup_url_kwarg = 'workspace_id'


    def perform_update(self, serializer):
        try:
            with transaction.atomic():
                task = serializer.save()
                
                # Check if completion status changed
                if 'completed_at' in serializer.validated_data:
                    if serializer.validated_data['completed_at'] and not task.completed_at:
                        # Task is being marked as completed
                        xp_earned = self._award_task_completion(task)
                        task.xp_earned = xp_earned
                        task.save()
                    elif not serializer.validated_data['completed_at'] and task.completed_at:
                        # Task is being un-completed
                        self._remove_task_completion(task)
                
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _remove_task_completion(self, task):
        """Handle task un-completion with profile check"""
        try:
            profile, _ = UserProfile.objects.get_or_create(user=task.user)
            if task.xp_earned > 0:
                profile.xp -= task.xp_earned
                profile.tasks_completed_total -= 1
                profile.save()
            task.xp_earned = 0
            task.completed_at = None
            task.save()
        except Exception as e:
            print(f"Error removing completion: {e}")


class UserProfileView(AuthenticatedAPIView, generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_object(self):
        profile = self.request.user.profile
        self.update_streak(profile)
        return profile

    def update_streak(self, profile):
        today = timezone.now().date()
        
        if profile.last_login_date:
            delta = today - profile.last_login_date
            if delta.days == 1:
                profile.streak_days += 1
                if profile.streak_days % 7 == 0:
                    profile.xp += 30
            elif delta.days > 1:
                profile.streak_days = 1
        
        profile.last_login_date = today
        profile.save()
        self._check_badges(profile)

    def _check_badges(self, profile):
        if profile.streak_days >= 3:
            self._award_badge(profile, 'streak_starter')

    def _award_badge(self, profile, badge_name):
        badge = Badge.objects.get(name=badge_name)
        UserBadge.objects.get_or_create(user=profile.user, badge=badge)


class FocusSessionView(AuthenticatedAPIView, generics.CreateAPIView):
    def create(self, request, *args, **kwargs):
        duration = request.data.get('duration', 25)
        task_id = request.data.get('task_id')
        
        with transaction.atomic():
            profile = request.user.profile
            profile.focus_minutes_total += duration
            profile.xp += duration
            profile.focus_sessions_count += 1
            profile.save()
            
            if profile.focus_sessions_count >= 10:
                self._award_badge(profile, 'zen_focus')
            
            if task_id:
                task = Task.objects.get(id=task_id, user=request.user)
                if not task.completed_at:
                    task.completed_at = timezone.now()
                    task.save()
                    self._award_task_completion(task)
            
            return Response({'xp_earned': duration}, status=status.HTTP_201_CREATED)

    def _award_task_completion(self, task):
        """Safe XP calculation with profile creation"""
        try:
            # Get or create user profile
            profile, created = UserProfile.objects.get_or_create(user=task.user)
            if created:
                print(f"Created new profile for user {task.user.username}")
            
            base_xp = 5
            
            # Priority bonus
            priority_bonus = {
                'H': 3,
                'M': 1,
                'L': 0
            }.get(task.priority, 0)
            
            # Timeliness bonus (only if both dates exist)
            timeliness_bonus = 0
            if task.due_date and task.completed_at:
                try:
                    timeliness_bonus = 7 if (task.completed_at <= task.due_date) else 0
                except TypeError:
                    print("Date comparison error")
            
            total_xp = base_xp + priority_bonus + timeliness_bonus
            
            # Update profile
            profile.xp += total_xp
            profile.tasks_completed_total += 1
            profile.save()
            
            # Check for level up and badges
            self._check_level_up(profile)
            self._check_badges(profile)
            
            return total_xp
            
        except Exception as e:
            print(f"Error in XP calculation: {e}")
            return 5  # Minimum XP fallback

    def _award_badge(self, profile, badge_name):
        badge = Badge.objects.get(name=badge_name)
        UserBadge.objects.get_or_create(user=profile.user, badge=badge)


class UserStatsView(AuthenticatedAPIView, generics.RetrieveAPIView):
    serializer_class = StatsSerializer

    def get_object(self):
        return self.request.user.profile


class BadgeListView(AuthenticatedAPIView, generics.ListAPIView):
    serializer_class = BadgeSerializer
    queryset = Badge.objects.all()