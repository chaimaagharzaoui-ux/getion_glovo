from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',      admin.site.urls),
    path('',            include('core.urls')),
    path('entreprise/', include('entreprise.urls')),
    path('commandes/',  include('commandes.urls')),
    path('livreurs/',   include('livreurs.urls')),
    path('clients/',    include('clients.urls')),
]
