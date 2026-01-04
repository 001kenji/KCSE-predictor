from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path
from django.shortcuts import render
from django.contrib import messages
from .models import Subject, PastQuestion, Prediction, TrainedModel
from .tasks_guide import KCSEQuestionProcessor

from .models import Account,PaperTopicSet
from django.contrib import admin
from django.contrib.auth.models import Group
from datetime import datetime
admin.site.site_title = 'login admin'
admin.site.site_header = 'LOGIN'
admin.site.site_index = 'Welcome Back'
from django.contrib.admin import site
import time, asyncio, json,os,datetime
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.conf import settings
from pathlib import Path
import shutil
BASE_DIR = Path(__file__).resolve().parent.parent




class OutstandingTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at','expires_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('created_at',)

class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'blacklist_date','blacklist_at')
    search_fields = ('user__email', 'user__username', 'token')
    list_filter = ('blacklist_date',)

ActiveUser = Account.objects.all()

@admin.register(Account)
class UserAccountAdmin (admin.ModelAdmin):
    
    list_display=('name','email','is_staff')
    exclude=['JobsHistory,rattings','requestedJobs']
    list_filter=['is_staff','is_active','is_superuser']

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = super().get_readonly_fields(request, obj)
        if obj and obj.email == "daimac@gmail.com":
            # Make all fields read-only for the user with email "daimac@gmail.com"
            return [field.name for field in self.model._meta.fields]
        return readonly_fields

    

    def response_add(self, request, obj, post_url_continue=None):
        # Get the created primary key of the user
        
        #creating a folder for each user as they are registered
        folder_name = str(obj.email)
        folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)

        # Create the folder
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
           
        # Call the parent's response_add method to continue with the default behavior
        
        return super().response_add(request, obj, post_url_continue)

    def save_model(self, request, obj, form, change):
        is_new = not Account.objects.filter(pk=obj.pk).exists()
        # print('Called save_model: is_new =', is_new)
        if is_new:  # If this is a new object
            
            obj.set_password(form.cleaned_data['password'])
           
            super().save_model(request, obj, form, change)
    
    def delete_model(self, request, obj):
        if obj.email == 'kenjicladia@gmail.com' or obj.email == 'gestuser@gmail.com':
            # Prevent deletion of the user with email "daimac@gmail.com"
            message = "You are not allowed to delete the Sole Administrator."
            self.message_user(request, message, level='ERROR')
            return False
        else:
            #removing entire user content details stored in the server
            folder_name = str(obj.email)
            folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)
            # Create the folder
            if os.path.exists(folder_path):
                shutil.rmtree(folder_path)
            super().delete_model(request, obj)
        
    def response_delete(self, request, obj_display, obj_id):
        opts = self.model._meta
        pk_value = obj_id
        preserved_filters = self.get_preserved_filters(request)

        if obj_display:
            deleted_objects = [obj_display]
        else:
            deleted_objects = [self.model._meta.verbose_name]

        if request.POST.get('_delete_confirmation') != '1':
            return HttpResponseRedirect(request.path)

        self.message_user(request, 'Successfully deleted %s.' % ' '.join(deleted_objects), messages.SUCCESS)
        # Instead of showing the success message, return to the change list
        return HttpResponseRedirect(reverse('admin:%s_%s_changelist' % (opts.app_label, opts.model_name)) + '?' + preserved_filters)


    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if not obj:
            New_fieldsets = (
                (None, {
                'fields': ('email', 'name','password','is_active', 'is_staff','is_superuser')
            }),
            ('Profile',{
                'fields' : ('ProfilePic','about')
            })
            ,)
        else:
            New_fieldsets = (
                (None, {
                'fields': ('email', 'name','is_active', 'is_staff','is_superuser')
            }),
            ('Profile',{
                'fields' : ('ProfilePic','about')
            })
            ,)
        return New_fieldsets 
    
    readonly_fields=('id',)
    

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')



@admin.register(PastQuestion)
class PastQuestionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'year', 'paper_number', 'topic', 'marks', 'question_type')
    list_filter = ('subject', 'year', 'paper_number', 'topic', 'question_type')
    search_fields = ('question_text', 'subject__name', 'topic__name')

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'confidence', 'created_at', 'updated_at')
    list_filter = ('subject', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    actions = ['refresh_predictions']

    def refresh_predictions(self, request, queryset):
        from .tasks import make_predictions
        make_predictions([pred.subject.id for pred in queryset])
        self.message_user(request, f"Refreshed {queryset.count()} predictions")
    refresh_predictions.short_description = "Refresh selected predictions"

@admin.register(TrainedModel)
class TrainedModelAdmin(admin.ModelAdmin):
    list_display = ('trained_at', 'accuracy', 'is_active')
    readonly_fields = ('trained_at',)
    actions = ['activate_model']
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('train-model/', self.admin_site.admin_view(self.train_model_view), name='train_model'),
            path('extract-pdfs/', self.admin_site.admin_view(self.extract_pdfs_view), name='extract_pdfs'),
        ]
        return custom_urls + urls
    
    def train_model_view(self, request):
        if request.method == 'POST':
            try:
                processor = KCSEQuestionProcessor()
                processor.train_prediction_model()
                messages.success(request, "AI model training started in the background!")
            except Exception as e:
                messages.error(request, f"Error starting training: {str(e)}")
            return HttpResponseRedirect("../")
        
        context = {
            **self.admin_site.each_context(request),
            'title': "Train New AI Model",
            'has_active_model': TrainedModel.objects.filter(is_active=True).exists(),
        }
        return render(request, 'admin/train_model.html', context)
    
    def extract_pdfs_view(self, request):
        if request.method == 'POST':
            try:
                processor = KCSEQuestionProcessor()
                processor.process_all_pdfs()
                messages.success(request, "PDF extraction started in the background!")
            except Exception as e:
                messages.error(request, f"Error starting PDF extraction: {str(e)}")
            return HttpResponseRedirect("../")
        
        context = {
            **self.admin_site.each_context(request),
            'title': "Extract PDF Data",
            'pdf_count': len([f for f in os.listdir('data/past_papers') if f.endswith('.pdf')]),
        }
        return render(request, 'admin/extract_pdfs.html', context)
    
    def activate_model(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Please select exactly one model to activate", level=messages.ERROR)
            return
        
        model = queryset.first()
        TrainedModel.objects.update(is_active=False)
        model.is_active = True
        model.save()
        self.message_user(request, f"Activated model trained at {model.trained_at}")
    activate_model.short_description = "Activate selected model"


@admin.register(PaperTopicSet)
class PaperTopicSetAdmin(admin.ModelAdmin):
    list_display = ('subject', 'year', 'paper_number', 'topics_count')
    list_filter = ('subject', 'year', 'paper_number')
    search_fields = ('subject__name', 'year', 'paper_number')
    ordering = ('subject', 'year', 'paper_number')
    
    def topics_count(self, obj):
        return len(obj.topics) if obj.topics else 0
    topics_count.short_description = 'Topics Count'

# admin.site.unregister(Group)