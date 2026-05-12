from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from .models import Livreur
from .serializers import LivreurLoginSerializer, LivreurSerializer


class LoginLivreurView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = LivreurLoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            l = Livreur.objects.get(email=s.validated_data["email"])
        except Livreur.DoesNotExist:
            return Response({"message": "Email introuvable"}, status=status.HTTP_401_UNAUTHORIZED)
        if not check_password(s.validated_data["mot_de_passe"], l.mot_de_passe):
            return Response({"message": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        if not l.valide:
            return Response({"message": "Compte en attente de validation"}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken()
        refresh["role"] = "livreur"
        refresh["livreur_id"] = l.id
        return Response({"token": str(refresh.access_token), "refresh": str(refresh), "livreur": LivreurSerializer(l).data})


class CommandesLivreurView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from commandes.models import Commande
        from commandes.serializers import CommandeSerializer

        statut = request.query_params.get("statut", "en_attente")
        lid = request.auth.get("livreur_id")
        if statut == "en_attente":
            qs = Commande.objects.filter(statut="en_attente").select_related("client", "entreprise")
        else:
            qs = Commande.objects.filter(livreur_id=lid, statut=statut).select_related("client", "entreprise")
        return Response(CommandeSerializer(qs, many=True).data)


class AccepterCommandeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, commande_id):
        from commandes.models import Commande
        from django.utils import timezone

        try:
            cmd = Commande.objects.get(id=commande_id)
        except Commande.DoesNotExist:
            return Response({"message": "Commande introuvable"}, status=status.HTTP_404_NOT_FOUND)
        if cmd.statut != "en_attente":
            return Response({"message": "Commande déjà prise"}, status=status.HTTP_409_CONFLICT)
        lid = request.auth.get("livreur_id")
        cmd.livreur_id = lid
        cmd.statut = "en_livraison"
        cmd.acceptee_at = timezone.now()
        cmd.save()
        return Response({"success": True, "commande_id": cmd.id})


class RejeterCommandeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, commande_id):
        return Response({"success": True})
