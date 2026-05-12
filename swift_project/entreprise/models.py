from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class Entreprise(models.Model):
    nom = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    mot_de_passe = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    avatar_emoji = models.CharField(max_length=10, default="🏪")
    ouvert = models.BooleanField(default=True)
    heure_ouv = models.TimeField(default="08:00")
    heure_ferm = models.TimeField(default="23:00")
    valide = models.BooleanField(default=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="profil_entreprise",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw):
        self.mot_de_passe = make_password(raw)

    def check_password_raw(self, raw):
        return check_password(raw, self.mot_de_passe)

    def __str__(self):
        return self.nom
