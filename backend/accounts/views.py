from django.shortcuts import render
from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required_fields = ['username', 'password', 'first_name', 'last_name', 'user_type']

        for field in required_fields:
            if field not in data:
                return Response({field: 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        user = User.objects.create_user(
            username=data['username'],
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

        # JWT Token (optional)
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
        
        
        
        

@api_view(['POST'])
def login_view(request):
    data = request.data
    user = authenticate(username=data.get('username'), password=data.get('password'))
    
    if user is not None:
        return Response({"message": "Login successful", "username": user.username}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
