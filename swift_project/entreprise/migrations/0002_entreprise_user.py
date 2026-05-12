# Generated manually for lien optionnel User <-> profils métier

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("entreprise", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="entreprise",
            name="user",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="profil_entreprise",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
