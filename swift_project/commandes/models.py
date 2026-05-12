from django.db import models


class Commande(models.Model):
    STATUTS = [
        ("en_attente", "En attente"),
        ("en_preparation", "En préparation"),
        ("en_livraison", "En livraison"),
        ("livree", "Livrée"),
        ("annulee", "Annulée"),
    ]
    numero_sw = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
    )
    entreprise = models.ForeignKey(
        "entreprise.Entreprise",
        on_delete=models.CASCADE,
        related_name="commandes",
    )
    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.SET_NULL,
        null=True,
        related_name="commandes",
    )
    livreur = models.ForeignKey(
        "livreurs.Livreur",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="commandes",
    )
    articles = models.JSONField(default=list)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    frais_livraison = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=2.99,
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUTS,
        default="en_attente",
    )
    adresse_livraison = models.JSONField(default=dict)
    evaluation_note = models.IntegerField(null=True, blank=True)
    evaluation_comment = models.TextField(blank=True)
    acceptee_at = models.DateTimeField(null=True, blank=True)
    livree_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.numero_sw:
            super().save(*args, **kwargs)
            self.numero_sw = f"SW-{self.id:04d}"
            Commande.objects.filter(id=self.id).update(numero_sw=self.numero_sw)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.numero_sw or f"CMD-{self.pk}"
