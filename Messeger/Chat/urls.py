from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.PredictionView.as_view(), name='predict-questions'),
    path('subjects/', views.SubjectListView.as_view(), name='get-subjects'),
    path('train/', views.TrainingWorkflowView.as_view(), name='training-workflow'),
]