from django.urls import path, include
from .views import (
    SearchRequestApiView,
)

urlpatterns = [
    path('search', SearchRequestApiView.as_view()),
]