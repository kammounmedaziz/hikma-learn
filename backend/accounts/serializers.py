from rest_framework import serializers
from .models import User
import random
import string

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',  # ✅ keep this to show in response
            'email',
            'password',
            'first_name',
            'last_name',
            'cin',
            'user_type',
            'phone_num',
            'birth_date',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
            'username': {'read_only': True},  # ✅ this line fixes the error
        }

    def create(self, validated_data):
        validated_data['username'] = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        user = User.objects.create_user(**validated_data)
        return user
