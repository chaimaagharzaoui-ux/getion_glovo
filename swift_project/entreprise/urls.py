from django.urls import path
from . import views

app_name = 'entreprise'

urlpatterns = [
    path('login/',        views.login_view,        name='login'),
    path('logout/',       views.logout_view,       name='logout'),
    path('dashboard/',    views.dashboard_view,    name='dashboard'),
    path('commandes/',    views.commandes_view,    name='commandes'),
    path('catalogue/',    views.catalogue_view,    name='catalogue'),
    path('statistiques/', views.statistiques_view, name='statistiques'),
    path('finances/',     views.finances_view,     name='finances'),
    path('parametres/',   views.parametres_view,   name='parametres'),
    path('support/',      views.support_view,      name='support'),
    path('toggle-statut/',views.toggle_statut,     name='toggle_statut'),
    path('api/commandes/',views.api_commandes_json,name='api_commandes'),
]
