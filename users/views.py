from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET
from rest_framework import permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from branches.models import Zone
from orders.models import Order

from .models import User


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role', 'client')
        phone = request.data.get('phone', '')
        zone_id = request.data.get('zone_id')

        if not username or not password:
            return Response({'detail': 'username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User(username=username, role=role, phone=phone)
        if zone_id:
            user.zone_id = zone_id
        user.set_password(password)
        user.save()
        return Response({'id': user.id, 'username': user.username, 'role': user.role}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        return Response({'id': user.id, 'username': user.username, 'role': user.role})


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out.'})


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                'id': request.user.id,
                'username': request.user.username,
                'role': request.user.role,
            }
        )


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Admin only.'}, status=403)
        return Response(
            {
                'total_clients': User.objects.filter(role='client').count(),
                'total_orders': Order.objects.count(),
                'pending_orders': Order.objects.filter(status='pending').count(),
                'in_delivery_orders': Order.objects.filter(status='in_delivery').count(),
                'completed_orders': Order.objects.filter(status='completed').count(),
            }
        )


@require_GET
def login_page(request):
    if request.user.is_authenticated:
        return redirect('role-dashboard')
    return render(request, 'login.html', {'zones': Zone.objects.order_by('name')})


@login_required
def role_dashboard(request):
    role_to_template = {
        'admin': 'users/dashboard_admin.html',
        'manager': 'users/dashboard_manager.html',
        'client': 'users/dashboard_client.html',
        'delivery': 'users/dashboard_delivery.html',
    }
    template_name = role_to_template.get(request.user.role, 'users/dashboard_client.html')
    context = {
        'user_role': request.user.role,
        'zones': Zone.objects.order_by('name'),
    }
    return render(request, template_name, context)
