from django.test import TestCase
from accounts.models import User, UserType

class UserSyncTests(TestCase):
    def test_create_user_with_admin_type_sets_superuser_and_staff(self):
        # Verifies that creating a user with user_type=ADMIN sets is_superuser and is_staff
        user = User.objects.create_user(username='adminuser', password="password", user_type=UserType.ADMIN)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertEqual(user.user_type, UserType.ADMIN)

    def test_create_superuser_sets_admin_type_and_staff(self):
        # Verifies that creating a superuser sets user_type=ADMIN and is_staff=True
        user = User.objects.create_superuser(username='superadmin', password="password", email="admin@example.com")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertEqual(user.user_type, UserType.ADMIN)