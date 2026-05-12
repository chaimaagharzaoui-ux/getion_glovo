from django.urls import path
from .views import (
    EntrepriseLoginPageView,
    DashboardEntreprisePageView,
    EntrepriseStatutPageView,
    EntrepriseLogoutPageView,
    CommandesPageView,
    CommandeStatutUpdatePageView,
    CataloguePageView,
    StatistiquesPageView,
    FinancePageView,
    ParametresPageView,
    SupportPageView,
)

urlpatterns = [
    path("login/", EntrepriseLoginPageView.as_view(), name="entreprise-login"),
    path("dashboard/", DashboardEntreprisePageView.as_view(), name="entreprise-dashboard"),
    path("commandes/", CommandesPageView.as_view(), name="entreprise-commandes"),
    path("commandes/<int:commande_id>/statut/", CommandeStatutUpdatePageView.as_view(), name="entreprise-commande-statut"),
    path("catalogue/", CataloguePageView.as_view(), name="entreprise-catalogue"),
    path("statistiques/", StatistiquesPageView.as_view(), name="entreprise-statistiques"),
    path("finance/", FinancePageView.as_view(), name="entreprise-finance"),
    path("parametres/", ParametresPageView.as_view(), name="entreprise-parametres"),
    path("support/", SupportPageView.as_view(), name="entreprise-support"),
    path("statut/", EntrepriseStatutPageView.as_view(), name="entreprise-statut-page"),
    path("logout/", EntrepriseLogoutPageView.as_view(), name="entreprise-logout"),
]
