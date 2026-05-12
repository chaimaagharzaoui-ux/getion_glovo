# Generated manually for lien optionnel User <-> profil livreur

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("livreurs", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="livreur",
            name="user",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="profil_livreur",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
