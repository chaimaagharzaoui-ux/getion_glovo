from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
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
        if role == 'admin':
            return Response(
                {
                    'detail': 'La création d’un compte administrateur depuis l’application est interdite.',
                    'erreurType': 'ADMIN_CREATION_INTERDITE',
                },
                status=status.HTTP_403_FORBIDDEN,
            )
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
        username = (request.data.get('username') or request.data.get('email') or request.data.get('identifiant') or '').strip()
        password = request.data.get('password')
        if not username or not password:
            return Response({'detail': 'username/email et password sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            # Fallback: autoriser la connexion via email (insensible à la casse)
            u = get_user_model().objects.filter(email__iexact=username).first()
            if u is not None:
                user = authenticate(username=u.username, password=password)

        if not user:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'detail': 'Compte désactivé.'}, status=status.HTTP_401_UNAUTHORIZED)
        if user.role == 'admin':
            allowed = (getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_EMAIL', '') or 'swift@gmail.com').strip().lower()
            principal_email = (user.email or '').strip().lower()
            if principal_email != allowed:
                return Response(
                    {
                        'detail': 'Accès refusé. Cet identifiant ne correspond pas au compte administrateur autorisé.',
                        'message': 'Accès refusé. Cet email n’est pas autorisé à accéder au panneau admin.',
                        'erreurType': 'EMAIL_NON_AUTORISE',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
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
        allowed = (getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_EMAIL', '') or 'swift@gmail.com').strip().lower()
        if (request.user.email or '').strip().lower() != allowed:
            return Response({'detail': 'Compte admin non autorisé pour ce panneau.'}, status=403)
        return Response(
            {
                'total_clients': User.objects.filter(role='client').count(),
                'total_orders': Order.objects.count(),
                'pending_orders': Order.objects.filter(status='pending').count(),
                'in_delivery_orders': Order.objects.filter(status='in_delivery').count(),
                'completed_orders': Order.objects.filter(status='completed').count(),
            }
        )


class PrincipalAdminLoginView(APIView):
    """Connexion réservée au seul email administrateur Swift (session Django)."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or request.data.get('username') or '').strip().lower()
        password = request.data.get('password') or request.data.get('motDePasse') or ''
        allowed = (getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_EMAIL', '') or 'swift@gmail.com').strip().lower()

        if not email or not password:
            return Response(
                {'detail': 'Email et mot de passe requis.', 'message': 'Veuillez remplir tous les champs.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email != allowed:
            return Response(
                {
                    'success': False,
                    'detail': 'Accès refusé. Cet email n’est pas autorisé à accéder au panneau admin.',
                    'message': 'Accès refusé. Cet email n’est pas autorisé à accéder au panneau admin.',
                    'erreurType': 'EMAIL_NON_AUTORISE',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        user = User.objects.filter(email__iexact=email, role='admin').first()
        if not user:
            return Response(
                {
                    'success': False,
                    'detail': 'Aucun compte admin configuré pour cet email. Exécutez ensure_swift_principal_admin.',
                    'message': 'Aucun compte admin configuré. Contactez le support technique.',
                    'erreurType': 'COMPTE_ADMIN_ABSENT',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        auth_user = authenticate(username=user.username, password=password)
        if not auth_user:
            return Response(
                {
                    'success': False,
                    'detail': 'Mot de passe incorrect.',
                    'message': 'Mot de passe incorrect.',
                    'erreurType': 'MOT_DE_PASSE_INCORRECT',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not auth_user.is_active:
            return Response(
                {'success': False, 'detail': 'Compte désactivé.', 'erreurType': 'COMPTE_INACTIF'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, auth_user)
        return Response(
            {
                'success': True,
                'id': auth_user.id,
                'username': auth_user.username,
                'role': auth_user.role,
                'email': auth_user.email or email,
                'admin': {
                    'id': auth_user.id,
                    'nom': auth_user.get_full_name() or auth_user.username,
                    'email': auth_user.email or email,
                },
            }
        )


class PrincipalAdminChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Réservé au compte administrateur.'}, status=status.HTTP_403_FORBIDDEN)
        allowed = (getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_EMAIL', '') or 'swift@gmail.com').strip().lower()
        if (request.user.email or '').strip().lower() != allowed:
            return Response({'detail': 'Compte non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

        old_pw = request.data.get('ancienMdp') or request.data.get('old_password') or ''
        new_pw = request.data.get('nouveauMdp') or request.data.get('new_password') or ''
        if not old_pw or not new_pw:
            return Response({'detail': 'Ancien et nouveau mot de passe requis.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_pw) < 8:
            return Response(
                {'detail': 'Le mot de passe doit faire au moins 8 caractères.', 'message': 'Le mot de passe doit faire au moins 8 caractères.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.check_password(old_pw):
            return Response(
                {'detail': 'Ancien mot de passe incorrect.', 'message': 'Ancien mot de passe incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_pw)
        request.user.save(update_fields=['password'])
        update_session_auth_hash(request, request.user)
        return Response({'success': True, 'message': 'Mot de passe changé avec succès.'})


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
        'employee': 'users/dashboard_manager.html',
        'client': 'users/dashboard_client.html',
        'delivery': 'users/dashboard_delivery.html',
    }
    template_name = role_to_template.get(request.user.role, 'users/dashboard_client.html')
    context = {
        'user_role': request.user.role,
        'zones': Zone.objects.order_by('name'),
    }
    return render(request, template_name, context)
