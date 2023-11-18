from django.urls import path, include
from .views import (
    SearchRequestApiView,
    SearchResultApiView,
    UploadDatasetApiView,
    ScrapDatasetApiView,
    PDFApiView,
)

urlpatterns = [
    path('search', SearchRequestApiView.as_view()),
    path('cache', SearchResultApiView.as_view()),
    path('upload/dataset', UploadDatasetApiView.as_view()),
    path('upload/scrap', ScrapDatasetApiView.as_view()),
    path('pdf', PDFApiView.as_view()),
]