from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Subject, Prediction
from .serializers import SubjectSerializer, PredictionSerializer
import json,os,aiofiles,time
from django.conf import settings
from asgiref.sync import sync_to_async
from django.http import JsonResponse
from google_auth_oauthlib.flow import Flow
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.views.decorators.csrf import csrf_exempt,ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from celery.result import AsyncResult
from .models import PaperTopicSet
from pathlib import Path
from .tasks_guide import KCSEQuestionProcessor
redisConnection = settings.REDIS_CONNECTION 


async def oauth_callback(request):
    state = request.GET.get('state')
    
    # Use sync_to_async for Redis KEYS
    matching_keys = await sync_to_async(redisConnection.keys)("oauth_flow:*")

    email = None
    data = None
    for key in matching_keys:
        raw_data = await sync_to_async(redisConnection.get)(key)
        data = json.loads(raw_data)
        if data["flow_state"] == state:
            email = data["email"]
            await sync_to_async(redisConnection.delete)(key)
            break

    if not email:
        return JsonResponse({'error': 'Invalid OAuth state or expired request'}, status=400)

    token_path = os.path.join(settings.MEDIA_ROOT, email, 'token.json')
    credential_file_path = data['client_secrets_file']

    # Still blocking: from_client_secrets_file — must wrap with sync_to_async
    flow = await sync_to_async(Flow.from_client_secrets_file)(
        credential_file_path,
        scopes=['https://www.googleapis.com/auth/youtube.upload'],
        redirect_uri=settings.GOOGLE_OAUTH_REDIRECT_URI
    )

    # Still blocking: fetch_token (Google API call)
    await sync_to_async(flow.fetch_token)(
        authorization_response=request.build_absolute_uri()
    )

    credentials = flow.credentials

    # ✅ Non-blocking file write using aiofiles
    import aiofiles
    async with aiofiles.open(token_path, 'w') as token_file:
        await token_file.write(credentials.to_json())

    return JsonResponse({'message': 'OAuth authentication successful!'})


@method_decorator(csrf_exempt,name='dispatch')
class SubjectListView(APIView):

    permission_classes = (AllowAny,)
    def get(self, request):
        subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        print('data:',serializer.data)
        return Response(serializer.data)


def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'Success': 'CSRF cookie set', 'encryptedToken': token})




@method_decorator(csrf_exempt, name='dispatch')
class PredictionView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        subject_id = request.data.get('subject_id')
        if not subject_id:
            return Response(
                {'error': 'subject_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response(
                {'error': 'Subject not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check for cached prediction
        prediction = Prediction.objects.filter(subject=subject).order_by('-updated_at').first()
        
        if not prediction:
            # Trigger prediction generation if none exists
            from .tasks_guide import KCSEQuestionProcessor
            processor = KCSEQuestionProcessor()
            processor._predict_for_subject(subject)
            
            return Response({
                'status': 'pending',
                'message': 'Prediction in progress. Please check back later.'
            }, status=status.HTTP_202_ACCEPTED)
        
        serializer = PredictionSerializer(prediction)
        return Response(serializer.data)


@method_decorator(csrf_exempt,name='dispatch')
class TrainingWorkflowView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        action = request.data.get('action')
        step = request.data.get('step', 1)
        subject_ids = request.data.get('subject_ids', None)
        if not action:
            return Response(
                {'error': 'No action specified'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        print('action: ',action)
        try:
            processor = KCSEQuestionProcessor()
            
            if action == 'extract_pdf_data':
                returndata =  processor.process_all_pdfs(subject_ids)
                
                task = returndata if returndata else False
                message = "PDF data extraction started successfully"
                
            elif action == 'train_ai_model':
                # Verify extraction was completed first
                if not self._check_previous_step_completed('extract_pdf_data'):
                    return Response(
                        {'error': 'Please complete PDF extraction first'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                returndata =  processor.train_prediction_model() 
                task = returndata if returndata else False
                message = "AI model training started successfully"
                
            elif action == 'make_predictions':
                # Verify training was completed first
                if not self._check_previous_step_completed('train_ai_model'):
                    return Response(
                        {'error': 'Please complete model training first'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                returndata = processor.make_subject_predictions(subject_ids)
                task = returndata if returndata else False
                message = "Prediction generation started successfully"
                
            else:
                return Response(
                    {'error': 'Invalid action specified'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Wait for task to complete (for demo - in production you'd poll)
            print('task is: ',task,task['success'],type(task['success']))
                
            if task['success'] == True:
                return Response({
                    'status': 'success',
                    'step': step,
                    'action': action,
                    'message': message,
                    'task_result': task['result']
                })
            else:
                return Response(
                    {'error': str(task.result)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    import os

    def _check_previous_step_completed(self, task_name: str) -> bool:
        """
        Check if the required previous step in the workflow has been completed.

        Args:
            task_name (str): The name of the current task.

        Returns:
            bool: True if the previous step is completed, False otherwise.
        """

        if task_name == 'extract_pdf_data':
            has_data = PaperTopicSet.objects.exists()
            if not has_data:
                print("Previous step incomplete: No PastQuestions found.")
                return False
            return True

        elif task_name == 'train_ai_model':
            BASE_DIR = Path(__file__).resolve().parent.parent
            model_dir = os.path.join(BASE_DIR,'media', 'ai_models')
            has_model = os.path.exists(model_dir) and any(
                fname.endswith('.pkl') for fname in os.listdir(model_dir)
            )
            if not has_model:
                print("Previous step incomplete: No trained AI models found in media/ai_models.")
                return False
            return True

        # Add more task-specific checks here if needed
        return False

