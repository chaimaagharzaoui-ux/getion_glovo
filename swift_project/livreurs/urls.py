from django.urls import path

from . import views

app_name = "livreurs"

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("dashboard/", views.dashboard_view, name="dashboard"),
    path("toggle-enligne/", views.toggle_enligne, name="toggle_enligne"),
    path(
        "commandes/<int:commande_id>/accepter/",
        views.accepter_commande,
        name="accepter_commande",
    ),
    path(
        "commandes/<int:commande_id>/refuser/",
        views.refuser_commande,
        name="refuser_commande",
    ),
    path(
        "commandes/<int:commande_id>/acceptee/",
        views.commande_acceptee_view,
        name="commande_acceptee",
    ),
    path(
        "commandes/<int:commande_id>/livre/",
        views.marquer_livre,
        name="marquer_livre",
    ),
    path(
        "api/commandes-attente/",
        views.api_commandes_attente,
        name="api_commandes_attente",
    ),
]
