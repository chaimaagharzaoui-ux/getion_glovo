from django.urls import path

from .views import (
    AdminDashboardView,
    LoginView,
    LogoutView,
    RegisterView,
    login_page,
    role_dashboard,
)

urlpatterns = [
    path('app/login', login_page, name='login-page'),
    path('app/dashboard', role_dashboard, name='role-dashboard'),
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('dashboard', AdminDashboardView.as_view(), name='admin-dashboard'),
]
