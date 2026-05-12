from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("email", "prenom", "nom", "user", "telephone", "created_at")
    search_fields = ("email", "nom", "prenom")
