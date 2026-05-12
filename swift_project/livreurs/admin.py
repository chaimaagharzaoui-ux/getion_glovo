from django.contrib import admin

from .models import Livreur


@admin.register(Livreur)
class LivreurAdmin(admin.ModelAdmin):
    list_display = ("email", "prenom", "nom", "user", "statut", "en_ligne", "valide")
    search_fields = ("email", "nom", "prenom")
