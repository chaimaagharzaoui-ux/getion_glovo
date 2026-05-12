from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class Livreur(models.Model):
    STATUTS = [
        ("disponible", "Disponible"),
        ("en_livraison", "En livraison"),
        ("hors_ligne", "Hors ligne"),
    ]
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20)
    mot_de_passe = models.CharField(max_length=255)
    en_ligne = models.BooleanField(default=False)
    statut = models.CharField(
        max_length=20,
        choices=STATUTS,
        default="hors_ligne",
    )
    note_moyenne = models.FloatField(default=0)
    total_notes = models.IntegerField(default=0)
    valide = models.BooleanField(default=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="profil_livreur",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw):
        self.mot_de_passe = make_password(raw)

    def check_password_raw(self, raw):
        return check_password(raw, self.mot_de_passe)

    def __str__(self):
        return f"{self.prenom} {self.nom}"
