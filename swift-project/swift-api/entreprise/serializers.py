from rest_framework import serializers
from .models import Entreprise


class EntrepriseLoginSerializer(serializers.Serializer):
    nom = serializers.CharField()
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True)


class EntrepriseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entreprise
        fields = [
            "id",
            "nom",
            "email",
            "telephone",
            "avatar_emoji",
            "ouvert",
            "heure_ouv",
            "heure_ferm",
        ]
