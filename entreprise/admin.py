from django.contrib import admin

from .models import Commande, Entreprise, Evaluation, ProduitCatalogue, TicketSupport


@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):
    list_display = ("nom", "email", "est_ouvert", "created_at")
    search_fields = ("nom", "email")


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ("numero", "entreprise", "client_nom", "montant", "statut", "created_at")
    list_filter = ("statut", "entreprise")


@admin.register(ProduitCatalogue)
class ProduitCatalogueAdmin(admin.ModelAdmin):
    list_display = ("nom", "entreprise", "prix", "disponible")


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ("commande", "note", "created_at")


@admin.register(TicketSupport)
class TicketSupportAdmin(admin.ModelAdmin):
    list_display = ("sujet", "entreprise", "statut", "created_at")
