from django.urls import path, include
from .views import (
    SearchRequestApiView,
    SearchResultApiView,
)

urlpatterns = [
    path('search', SearchRequestApiView.as_view()),
    path('cache', SearchResultApiView.as_view()),
]