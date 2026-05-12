"""Crée ou met à jour le compte administrateur Swift principal (email + mot de passe depuis les settings)."""
from django.conf import settings
from django.core.management.base import BaseCommand

from users.models import User

PRINCIPAL_USERNAME = 'swift_principal_admin'


class Command(BaseCommand):
    help = 'Crée ou synchronise le compte admin Swift principal (SWIFT_PRINCIPAL_ADMIN_EMAIL).'

    def handle(self, *args, **options):
        email = (getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_EMAIL', '') or 'swift@gmail.com').strip()
        pwd = getattr(settings, 'SWIFT_PRINCIPAL_ADMIN_INITIAL_PASSWORD', '') or 'swift@'

        if User.objects.filter(email__iexact=email).exclude(role='admin').exists():
            self.stdout.write(
                self.style.ERROR(f'L’email {email} est déjà utilisé par un compte non-admin.')
            )
            return

        user = User.objects.filter(username=PRINCIPAL_USERNAME).first()
        if not user:
            user = User.objects.filter(role='admin', email__iexact=email).first()

        admin_qs = User.objects.filter(role='admin')
        if not user and admin_qs.count() == 1:
            user = admin_qs.first()

        if not user:
            if admin_qs.exists():
                self.stdout.write(
                    self.style.ERROR(
                        'Plusieurs comptes admin existent. Gardez un seul compte admin ou '
                        f'utilisez le nom d’utilisateur Django « {PRINCIPAL_USERNAME} » pour le principal.'
                    )
                )
                return
            user = User(
                username=PRINCIPAL_USERNAME,
                role='admin',
                phone='0',
                is_staff=True,
                is_superuser=True,
            )
            user.email = email
            user.set_password(pwd)
            user.save()
            self.stdout.write(self.style.SUCCESS('Compte administrateur Swift principal créé.'))
            self._print_credentials(email)
            return

        # Mise à jour : email principal + mot de passe + cohérence des droits
        if user.username != PRINCIPAL_USERNAME and User.objects.filter(username=PRINCIPAL_USERNAME).exclude(pk=user.pk).exists():
            self.stdout.write(
                self.style.ERROR(
                    f'Le nom d’utilisateur « {PRINCIPAL_USERNAME} » est déjà pris par un autre utilisateur.'
                )
            )
            return

        if user.username != PRINCIPAL_USERNAME:
            user.username = PRINCIPAL_USERNAME

        user.email = email
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        if not (user.phone or '').strip():
            user.phone = '0'
        user.set_password(pwd)
        user.save()
        self.stdout.write(self.style.SUCCESS('Compte administrateur Swift principal synchronisé.'))
        self._print_credentials(email)

    def _print_credentials(self, email):
        self.stdout.write(f'  Email de connexion Swift : {email}')
        self.stdout.write(f'  Nom d’utilisateur Django : {PRINCIPAL_USERNAME}')
        self.stdout.write('  Mot de passe : valeur de SWIFT_PRINCIPAL_ADMIN_INITIAL_PASSWORD (settings / env).')
        self.stdout.write(self.style.WARNING('  En production : mot de passe fort + variables d’environnement.'))
