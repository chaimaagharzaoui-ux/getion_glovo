from django.conf import settings
from rest_framework import status
from rest_framework.response import Response


def swift_principal_email_normalized():
    return (getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_EMAIL', '') or 'swift@gmail.com').strip().lower()


def is_swift_principal_admin(user) -> bool:
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'admin':
        return False
    return (user.email or '').strip().lower() == swift_principal_email_normalized()


def principal_admin_forbidden():
    return Response({'detail': 'Accès réservé à l’administrateur principal Swift.'}, status=status.HTTP_403_FORBIDDEN)
