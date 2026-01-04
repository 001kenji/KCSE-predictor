from rest_framework import serializers
from .models import Subject, Prediction

from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model

from rest_framework import serializers
from .models import AccountManager
User = get_user_model()
class UserCreateSerializer(UserCreateSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    class Meta (UserCreateSerializer.Meta):
        model = User
        fields = (
            'id','email',
            'is_active',
            'name','password',            
            )

    
class UserSerializer(serializers.ModelSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    #including an extra external field
    # 
    class Meta:
        model = User
        
        fields = ( 
            'name','email','id','ProfilePic','about')





class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code']

class PredictionSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()
    
    class Meta:
        model = Prediction
        fields = ['id', 'subject', 'predicted_topics', 'confidence', 'updated_at']