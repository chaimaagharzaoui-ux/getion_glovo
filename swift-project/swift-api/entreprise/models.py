from django.db import models
from django.contrib.auth.hashers import make_password, check_password


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
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw):
        self.mot_de_passe = make_password(raw)

    def check_password_raw(self, raw):
        return check_password(raw, self.mot_de_passe)

    def __str__(self):
        return self.nom


class Produit(models.Model):
    entreprise = models.ForeignKey(Entreprise, on_delete=models.CASCADE, related_name="produits")
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    categorie = models.CharField(max_length=100, blank=True)
    disponible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} ({self.entreprise.nom})"


class Transaction(models.Model):
    entreprise = models.ForeignKey(Entreprise, on_delete=models.CASCADE, related_name="transactions")
    commande = models.ForeignKey("commandes.Commande", on_delete=models.SET_NULL, null=True, blank=True)
    montant_brut = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_net = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transaction #{self.id}"


class TicketSupport(models.Model):
    SUJETS = [
        ("commande", "Probleme commande"),
        ("facturation", "Facturation"),
        ("technique", "Technique"),
        ("autre", "Autre"),
    ]
    STATUTS = [
        ("ouvert", "Ouvert"),
        ("resolu", "Resolu"),
    ]
    entreprise = models.ForeignKey(Entreprise, on_delete=models.CASCADE, related_name="tickets_support")
    sujet = models.CharField(max_length=50, choices=SUJETS)
    message = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUTS, default="ouvert")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Ticket {self.get_sujet_display()} - {self.entreprise.nom}"
