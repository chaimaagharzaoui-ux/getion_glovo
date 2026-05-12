from django.contrib import admin
from django.urls import path, include
from entreprise.views import HomeView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", HomeView.as_view(), name="home"),
    path("entreprise/", include("entreprise.urls")),
    path("api/entreprise/", include("entreprise.api_urls")),
    path("api/commandes/", include("commandes.urls")),
    path("api/livreurs/", include("livreurs.urls")),
    path("api/clients/", include("clients.urls")),
]
