from rest_framework import serializers
from .models import User
import random
import string

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username', 
            'email',
            'password',
            'first_name',
            'last_name',
            'cin',
            'phone_num',
            'birth_date',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
            'username': {'read_only': True},  
        }

    def create(self, validated_data):
        
        first_name = validated_data.get('first_name', 'XX').upper()

        
        prefix = ''.join(random.choices(string.digits, k=3))
        middle = first_name
        suffix = ''.join(random.choices(string.digits, k=4))

        
        username = prefix + middle + suffix

        
        while User.objects.filter(username=username).exists():
            prefix = ''.join(random.choices(string.digits, k=3))
            suffix = ''.join(random.choices(string.digits, k=4))
            username = prefix + middle + suffix

        validated_data['username'] = username
        return User.objects.create_user(**validated_data)