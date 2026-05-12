from django.contrib import admin

from .models import Commande


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = (
        "numero_sw",
        "entreprise",
        "client",
        "montant_total",
        "statut",
        "created_at",
    )
    list_filter = ("statut", "entreprise")
    search_fields = ("numero_sw",)
