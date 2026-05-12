from rest_framework import serializers
from .models import Commande


class CommandeSerializer(serializers.ModelSerializer):
    client_detail = serializers.SerializerMethodField()
    statut_label = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            "id",
            "numero_sw",
            "client_detail",
            "montant_total",
            "frais_livraison",
            "statut",
            "statut_label",
            "articles",
            "adresse_livraison",
            "created_at",
            "livree_at",
            "acceptee_at",
        ]

    def get_client_detail(self, obj):
        if obj.client:
            return {
                "id": obj.client.id,
                "nom": obj.client.nom,
                "prenom": obj.client.prenom,
                "telephone": obj.client.telephone,
            }
        return None

    def get_statut_label(self, obj):
        labels = {
            "en_attente": "En attente",
            "en_preparation": "En préparation",
            "en_livraison": "En livraison",
            "livree": "Livré",
            "annulee": "Annulé",
        }
        return labels.get(obj.statut, obj.statut)
