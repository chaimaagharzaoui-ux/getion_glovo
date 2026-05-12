from rest_framework import serializers
from .models import Livreur


class LivreurLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True)


class LivreurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livreur
        fields = [
            "id",
            "nom",
            "prenom",
            "email",
            "telephone",
            "en_ligne",
            "statut",
            "note_moyenne",
        ]
