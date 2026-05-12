from django.urls import path
from .views import LoginEntrepriseView, StatsEntrepriseView, StatutEntrepriseView

urlpatterns = [
    path("login/", LoginEntrepriseView.as_view()),
    path("stats/", StatsEntrepriseView.as_view()),
    path("statut/", StatutEntrepriseView.as_view()),
]
