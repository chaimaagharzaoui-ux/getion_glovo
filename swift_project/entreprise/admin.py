from django.contrib import admin

from .models import Entreprise


@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):
    list_display = ("nom", "email", "user", "ouvert", "valide", "created_at")
    search_fields = ("nom", "email")
