"""
Modèles de l'espace entreprise Swift (livraison).
Les mots de passe sont stockés hashés (make_password / check_password).
"""
from datetime import time

from django.db import models


class Entreprise(models.Model):
    """Compte entreprise partenaire Swift."""

    nom = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    # Mot de passe hashé (identique au format Django User)
    mot_de_passe = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="logos_entreprise/", blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, default="")
    adresse = models.CharField(max_length=300, blank=True, default="")
    horaire_ouverture = models.TimeField(default=time(8, 0))
    horaire_fermeture = models.TimeField(default=time(23, 0))
    est_ouvert = models.BooleanField(default=True)
    en_ligne = models.BooleanField(default=False)
    taux_acceptation = models.FloatField(default=96.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Commande(models.Model):
    """Commande rattachée à une entreprise."""

    STATUTS = [
        ("en_attente", "En attente"),
        ("en_preparation", "En préparation"),
        ("en_livraison", "En livraison"),
        ("livree", "Livré"),
        ("annulee", "Annulé"),
    ]

    numero = models.CharField(max_length=20)
    entreprise = models.ForeignKey(
        Entreprise, on_delete=models.CASCADE, related_name="commandes"
    )
    client_nom = models.CharField(max_length=200)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=STATUTS, default="en_attente")
    # Renseigné lorsque le statut passe à « livree » (pour calcul du temps de livraison)
    livree_le = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entreprise", "-created_at"]),
            models.Index(fields=["entreprise", "statut"]),
        ]

    def __str__(self):
        return f"{self.numero} — {self.client_nom}"


class ProduitCatalogue(models.Model):
    """Produit du catalogue d'une entreprise."""

    entreprise = models.ForeignKey(
        Entreprise, on_delete=models.CASCADE, related_name="produits_catalogue"
    )
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    prix = models.DecimalField(max_digits=8, decimal_places=2)
    categorie = models.CharField(max_length=100, blank=True, default="")
    image = models.ImageField(upload_to="produits_catalogue/", blank=True, null=True)
    disponible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Produit catalogue"
        verbose_name_plural = "Produits catalogue"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Evaluation(models.Model):
    """Évaluation client après livraison (note liée à une commande)."""

    commande = models.OneToOneField(
        Commande, on_delete=models.CASCADE, related_name="evaluation"
    )
    note = models.IntegerField()  # 1 à 5
    commentaire = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Évaluation"
        verbose_name_plural = "Évaluations"

    def __str__(self):
        return f"{self.commande.numero} — {self.note}/5"


class TicketSupport(models.Model):
    """Ticket de support envoyé depuis l'espace entreprise."""

    STATUTS = [
        ("ouvert", "Ouvert"),
        ("resolu", "Résolu"),
    ]

    entreprise = models.ForeignKey(
        Entreprise, on_delete=models.CASCADE, related_name="tickets_support"
    )
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUTS, default="ouvert")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ticket support"
        verbose_name_plural = "Tickets support"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sujet} ({self.get_statut_display()})"
