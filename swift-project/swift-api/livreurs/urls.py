from django.urls import path
from .views import LoginLivreurView, CommandesLivreurView, AccepterCommandeView, RejeterCommandeView

urlpatterns = [
    path("login/", LoginLivreurView.as_view()),
    path("commandes/", CommandesLivreurView.as_view()),
    path("commandes/<int:commande_id>/accepter/", AccepterCommandeView.as_view()),
    path("commandes/<int:commande_id>/rejeter/", RejeterCommandeView.as_view()),
]
