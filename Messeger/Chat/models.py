from django.db import models
from django.shortcuts import get_list_or_404
from django.db.models import Prefetch
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager,Group,Permission
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.authtoken.models import Token
from django.utils.html import escape, strip_tags
import re,json,os
from django.contrib.postgres.fields import JSONField
from django.core.validators import EmailValidator, RegexValidator
from django.core.exceptions import ValidationError
#for making a multiple select field in the admin panel site
#from multiselectfield import MultiSelectField
from channels.db import database_sync_to_async
import uuid,datetime
from django.core.exceptions import ValidationError

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
def alphanumeric_validator(value): #for the name and text to  be validated and avoid attacks
    #regex = re.compile(r'^[a-zA-Z0-9]*$')
    regex = re.compile(r'^[a-zA-Z0-9.,\'\s]*$')
    if not regex.match(value):
        raise ValidationError('Only alphanumeric characters are allowed.')

def json_validator(value): #for the name and text to  be validated and avoid attacks
    try:
        data = json.loads(value)
        if not isinstance(data, list):
            raise ValidationError('ChatLog must be a list')
        for item in data:
            if not isinstance(item, dict):
                raise ValidationError('Each item in ChatLog must be a dictionary')
    except json.JSONDecodeError:
        raise ValidationError('Invalid JSON')


def sanitize_string(input_string):
    # Escape any HTML tags
    escaped_string = escape(input_string)

    # Remove all HTML tags
    sanitized_string = strip_tags(escaped_string)

    return sanitized_string

def generate_unique_id():
    return str(uuid.uuid4())[:16]  # Generates a unique ID with the first 8 characters of a UUID

def generate_e2e_id():
    return str(uuid.uuid4())[:32]  # Generates a unique ID with the first 8 characters of a UUID


class AccountManager(BaseUserManager):
   
    def create_user(self,email,name, password=None):
        if not email:
            raise ValueError("User must have an email address")
             
        
            
        email = self.normalize_email(email)
        name = sanitize_string(name)
        SanitizedName = sanitize_string(name)
        user = self.model(email=email, name=SanitizedName)        
        user.set_password(str(password))
        user.is_active = True 
        print(user.id)
        user.save(using=self._db)
        #creating a folder for each user as they are registered
        folder_name = str(email)
        folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)

        # Create the folder
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        return user

    def create_superuser(self,email, name,password=None):
        if not email:
            raise ValueError("User must have an email address")
        
        email = self.normalize_email(email)
        SanitizeName = sanitize_string(name)
        user = self.create_user( email=email, name=SanitizeName)        
        user.set_password(str(password))
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
       
        # assigning permission to the user
        content_types = ContentType.objects.all()
        for permission in Permission.objects.filter(content_type__in=content_types):
            user.user_permissions.add(permission)
        user.save(using=self._db)
        return user 


__all__ = ['Account']

class Account(AbstractBaseUser,PermissionsMixin):

    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    email = models.EmailField(max_length=40, validators=[EmailValidator()], unique=True,db_index=True)
    name = models.CharField(max_length=30, validators=[alphanumeric_validator])
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    ProfilePic = models.ImageField(upload_to='images/',default='/images/fallback.jpeg',verbose_name='Profile Picture', blank=True )

    groups = models.ManyToManyField(
        Group,
        related_name='useraccount_set',  # Custom related_name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='useraccount_set',  # Custom related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name
    
    def __str__(self):
        return f'{self.name} ※ {self.email}'
    objects = AccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
# this is for creating a balcklist method

# PaperTopicOccurrence

class Subject(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    
    def __str__(self):
        return self.name


class PaperTopicSet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    year = models.IntegerField()
    paper_number = models.IntegerField()
    topics = models.JSONField()  # store list of topics as a JSON array

    class Meta:
        unique_together = ('subject', 'year', 'paper_number')

    def __str__(self):
        return f"{self.subject.name} {self.year} P{self.paper_number}: {len(self.topics)} topics"


class PastQuestion(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    topic = models.TextField(null=True,blank=True)
    year = models.IntegerField()
    paper_number = models.IntegerField()
    question_text = models.TextField()
    marks = models.IntegerField()
    question_type = models.CharField(max_length=50, blank=True)  # definition, calculation, essay
    
    # class Meta:
    #     unique_together = ('subject', 'year', 'paper_number')
    
    def __str__(self):
        return f"{self.subject.name} {self.year} Paper {self.paper_number} - Q{self.id}"

class Prediction(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    predicted_topics = models.JSONField()
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField()

    class Meta:
        unique_together = ('subject',)

    def __str__(self):
        return f"Prediction for {self.subject.name} (updated: {self.updated_at})"


class TrainedModel(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    model_file = models.FileField(upload_to='ai_models/')
    vectorizer_file = models.FileField(upload_to='ai_models/')
    accuracy = models.FloatField(null=True, blank=True)
    trained_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    
    def clean(self):
        if self.is_active:
            # Ensure only one active model exists
            existing_active = TrainedModel.objects.filter(is_active=True).exclude(pk=self.pk)
            if existing_active.exists():
                raise ValidationError("There can only be one active model at a time")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Model trained at {self.trained_at} (Accuracy: {self.accuracy or 'N/A'})"