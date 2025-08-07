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


from django.core.mail import send_mail





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
import os
import requests
from rest_framework.response import Response
from django.conf import settings



logger = logging.getLogger(__name__)
User = get_user_model()

API_KEY = settings.FACEPP_API_KEY
API_SECRET = settings.FACEPP_API_SECRET
FACESET_TOKEN = settings.FACESET_TOKEN



@api_view(['POST'])
def register_face_recognition(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()

        face_image = request.FILES.get('face_image')
        if not face_image:
            return Response({'error': 'Face image required.'}, status=400)

        print("API Key is:", API_KEY)  # debug print

        detect_response = requests.post(
            'https://api-us.faceplusplus.com/facepp/v3/detect',
            files={'image_file': face_image},  # correct key here
            data={'api_key': API_KEY, 'api_secret': API_SECRET}
        ).json()

        print("Detect response:", detect_response)  # debug print

        if not detect_response.get('faces'):
            return Response({'error': 'No face detected.'}, status=400)

        face_token = detect_response['faces'][0]['face_token']

        addface_response = requests.post(
            'https://api-us.faceplusplus.com/facepp/v3/faceset/addface',
            data={
                'api_key': API_KEY,
                'api_secret': API_SECRET,
                'faceset_token': FACESET_TOKEN,
                'face_tokens': face_token
            }
        ).json()

        if addface_response.get('face_added') != 1:
            return Response({'error': 'Failed to add face to FaceSet.'}, status=500)

        user.face_token = face_token
        user.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_with_face(request):
    face_image = request.FILES.get('face_image')
    if not face_image:
        return Response({'error': 'Face image is required.'}, status=400)

    # Detect face
    detect_response = requests.post(
        'https://api-us.faceplusplus.com/facepp/v3/detect',
        files={'image_file': face_image},
        data={'api_key': API_KEY, 'api_secret': API_SECRET}
    ).json()

    if not detect_response.get('faces'):
        return Response({'error': 'No face detected.'}, status=400)

    face_token = detect_response['faces'][0]['face_token']

    # Search for the face in the FaceSet
    search_response = requests.post(
        'https://api-us.faceplusplus.com/facepp/v3/search',
        data={
            'api_key': API_KEY,
            'api_secret': API_SECRET,
            'face_token': face_token,
            'faceset_token': FACESET_TOKEN
        }
    ).json()

    print("Search response:", search_response)

    if 'results' not in search_response or not search_response['results']:
        return Response({'error': 'Face not recognized.'}, status=401)

    matched_token = search_response['results'][0]['face_token']
    confidence = search_response['results'][0]['confidence']

    # Optional: use confidence threshold to avoid false matches
    if confidence < 80:
        return Response({'error': 'Face match confidence too low.'}, status=401)

    # Get the user with this face_token
    try:
        user = User.objects.get(face_token=matched_token)
    except User.DoesNotExist:
        return Response({'error': 'User not found for this face.'}, status=404)

    # Login: return tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        "message": "Face login successful",
        "username": user.username,
        "user_id": user.id,
        "user_type": user.user_type,
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }, status=200)


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

          # Send password to email
        send_mail(
            'Your Teacher Account Credentials',
            f'Your account has been created.\nUsername: {username}\nPassword: {password}',
            'hikma.learn.edu@gmail.com',
            [data['email']],
            fail_silently=False,
        )
       
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
            "user_type": user.user_type,
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
    

@api_view(['GET'])
def list_students(request):
    students = User.objects.filter(user_type='student')
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
            "disabilities": user.disabilities
        }
        for user in students
    ]
    return Response(serialized)

@api_view(['PUT'])
def update_student(request, pk):
    try:
        student = User.objects.get(pk=pk, user_type='student')
        serializer = TeacherSerializer(student, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_student(request, pk):
    try:
        student = User.objects.get(pk=pk, user_type='student')
        student.delete()
        return Response({"message": "Student deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



    
    
    
    
    
    
    