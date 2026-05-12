from django.urls import path
from .views import CommandesListView

urlpatterns = [
    path("", CommandesListView.as_view()),
]
