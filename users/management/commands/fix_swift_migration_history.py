"""
Corrige l’erreur « driver.0001_initial is applied before its dependency entreprise.0001_admin_swift_fields ».

À utiliser uniquement si les tables de l’app `entreprise` existent déjà en base (schéma déjà créé),
mais que la ligne correspondante manque dans `django_migrations`.

Ensuite : python manage.py migrate
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone


class Command(BaseCommand):
    help = 'Enregistre entreprise.0001_admin_swift_fields dans django_migrations si les tables existent.'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            names = connection.introspection.table_names(cursor)

        has_entreprise_schema = 'entreprise_commande' in names
        has_driver_without_fk = 'driver_driver' in names and not has_entreprise_schema
        # Bases MyISAM ou anciennes applis : driver appliqué sans tables entreprise ni contrainte FK
        if not has_entreprise_schema and not has_driver_without_fk:
            self.stdout.write(
                self.style.ERROR(
                    'Aucune trace entreprise ni driver : base inattendue. '
                    'Utilisez une base neuve ou restaurez django_migrations.'
                )
            )
            return
        if has_driver_without_fk:
            self.stdout.write(
                self.style.WARNING(
                    'Tables « entreprise_* » absentes mais « driver_driver » présent (ex. MyISAM sans FK). '
                    'On enregistre quand même entreprise.0001 pour débloquer migrate. '
                    'Si vous utilisez les modèles entreprise, exécutez le SQL de cette migration dans MySQL.'
                )
            )

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT COUNT(*) FROM django_migrations WHERE app = %s AND name = %s',
                ['entreprise', '0001_admin_swift_fields'],
            )
            if cursor.fetchone()[0] > 0:
                self.stdout.write(self.style.SUCCESS('Migration entreprise.0001_admin_swift_fields déjà enregistrée.'))
                return
            cursor.execute(
                'INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, %s)',
                ['entreprise', '0001_admin_swift_fields', timezone.now()],
            )
        self.stdout.write(
            self.style.SUCCESS(
                'Ligne ajoutée pour entreprise.0001_admin_swift_fields. Lancez : python manage.py migrate'
            )
        )
