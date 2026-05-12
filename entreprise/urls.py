"""Routage de l'espace entreprise Swift."""

from django.urls import path

from . import views

urlpatterns = [
    path("entreprise/login/", views.login_entreprise, name="login_entreprise"),
    path("entreprise/dashboard/", views.dashboard, name="dashboard"),
    path("entreprise/commandes/", views.commandes, name="commandes"),
    path(
        "entreprise/commandes/<int:id>/statut/",
        views.changer_statut,
        name="changer_statut",
    ),
    path("entreprise/catalogue/", views.catalogue, name="catalogue"),
    path("entreprise/catalogue/ajouter/", views.ajouter_produit, name="ajouter_produit"),
    path(
        "entreprise/catalogue/modifier/<int:id>/",
        views.modifier_produit,
        name="modifier_produit",
    ),
    path(
        "entreprise/catalogue/supprimer/<int:id>/",
        views.supprimer_produit,
        name="supprimer_produit",
    ),
    path(
        "entreprise/catalogue/<int:id>/json/",
        views.produit_json,
        name="produit_json",
    ),
    path("entreprise/statistiques/", views.statistiques, name="statistiques"),
    path(
        "entreprise/api/statistiques/",
        views.api_statistiques,
        name="api_statistiques",
    ),
    path("entreprise/finances/", views.finances, name="finances"),
    path(
        "entreprise/finances/export-csv/",
        views.finances_export_csv,
        name="finances_export_csv",
    ),
    path("entreprise/parametres/", views.parametres, name="parametres"),
    path("entreprise/support/", views.support, name="support"),
    path("entreprise/toggle-ouverture/", views.toggle_ouverture, name="toggle_ouverture"),
    path("entreprise/api/stats/", views.api_stats, name="api_stats"),
    path("entreprise/logout/", views.logout_entreprise, name="logout_entreprise"),
]
