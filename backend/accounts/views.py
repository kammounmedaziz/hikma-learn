from django.shortcuts import render
from django.contrib.auth import authenticate

from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from .serializers import RegisterSerializer
from rest_framework import status
from .models import User
from .serializers import TeacherSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated





import random
import string


from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)
User = get_user_model()



@api_view([ 'POST'])
def create_teacher_user(request):
    try:
        data = request.data
        required_fields = ['first_name', 'last_name', 'email', 'fields', 'cin', 'user_type']

        for field in required_fields:
            if field not in data:
                return Response({field: 'This information is missing.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate random username and password
        username = f"teacher_{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        user = User(
            username=username,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            user_type=data['user_type'],
            fields=data.get('fields', []),
            cin=data.get('cin'),
            phone_num=data.get('phone_num'),
            birth_date=data.get('birth_date'),
            photo=data.get('photo')
        )
        user.set_password(password) # Hash the password
        user.full_clean()
        user.save()

        return Response({
            "message": "Teacher user created",
            "username": username,
            "password": password
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=500)



@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()

import random
import string

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required_fields = ['password', 'first_name', 'last_name', 'user_type']

        for field in required_fields:
            if field not in data:
                return Response({field: 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate username like in your create_teacher_user
        username = f"teacher_{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"

        user = User.objects.create_user(
            username=username,
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            email=data.get('email', ''),
            user_type=data['user_type'],
            phone_num=data.get('phone_num', ''),
            birth_date=data.get('birth_date', None),
            disabilities=data.get('disabilities', []),
            fields=data.get('fields', []),
        )

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully.",
            "username": username,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
 

@api_view(['POST'])
def login_view(request):
    data = request.data
    user = authenticate(username=data.get('username'), password=data.get('password'))
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful",
            "username": user.username,
            "user_id": user.id,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    
    
    
@api_view(['GET'])
def list_teachers(request):
    teachers = User.objects.filter(user_type='teacher')

    serialized = [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "cin": user.cin,
            "phone_num": user.phone_num,
            "birth_date": user.birth_date,
            "fields": user.fields,
        }
        for user in teachers
    ]
    return Response(serialized)

@api_view(['PUT'])
def update_teacher(request, pk):
    try:
        teacher = User.objects.get(pk=pk, user_type='teacher')
        serializer = TeacherSerializer(teacher, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_teacher(request, pk):
    try:
        teacher = User.objects.get(pk=pk, user_type='teacher')
        teacher.delete()
        return Response({"message": "Teacher deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request, pk):
    try:
        # Debugging logs
        logger.info(f"Password change request from user {request.user.id} for user {pk}")
        
        # Get target user
        target_user = User.objects.get(pk=pk)
        
        # Verify requesting user matches target user
        if request.user.id != target_user.id:
            logger.warning(f"User {request.user.id} attempted to change password for user {pk}")
            return Response(
                {"error": "You can only change your own password."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get password data
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validate required fields
        if not all([old_password, new_password, confirm_password]):
            return Response(
                {"error": "All password fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password match
        if new_password != confirm_password:
            return Response(
                {"error": "New passwords don't match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify old password
        if not target_user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password strength
        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Change password
        target_user.set_password(new_password)
        target_user.save()

        logger.info(f"Password changed successfully for user {pk}")
        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return Response(
            {"error": "An error occurred during password change."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_password_change_time(request, pk):
    try:
        user = User.objects.get(pk=pk)
        return Response({
            "password_changed_at": user.password_changed_at
        })
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404) 
    
@api_view(['GET', 'PUT'])
def update_disabilities(request, pk):
    try:
        user = User.objects.get(pk=pk)
        
        if request.method == 'GET':
            return Response({
                "disabilities": user.disabilities
            })
            
        elif request.method == 'PUT':
            disabilities = request.data.get('disabilities', [])
            user.disabilities = disabilities
            user.save()
            return Response({
                "message": "Disabilities updated.",
                "disabilities": user.disabilities
            })
            
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)