from django.urls import path, include
from .views import (
    SearchRequestApiView,
    SearchResultApiView,
    UploadDatasetApiView,
)

urlpatterns = [
    path('search', SearchRequestApiView.as_view()),
    path('cache', SearchResultApiView.as_view()),
    path('upload/dataset', UploadDatasetApiView.as_view()),
]