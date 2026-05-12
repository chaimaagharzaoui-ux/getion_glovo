from django.urls import path
from django.views.generic import RedirectView

from . import views

app_name = "driver"

urlpatterns = [
    path("livreur/login/", views.driver_login, name="driver_login"),
    path("livreur/register/", views.driver_register, name="driver_register"),
    path("livreur/dashboard/", views.driver_dashboard, name="driver_dashboard"),
    path("livreur/logout/", views.driver_logout, name="driver_logout"),
    path(
        "driver/auth/",
        RedirectView.as_view(pattern_name="driver:driver_login", permanent=False),
        name="auth",
    ),
    path("driver/logout/", views.driver_logout, name="logout"),
    path("driver/dashboard/", views.driver_dashboard, name="dashboard_legacy"),
]
