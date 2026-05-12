from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Commande
from .serializers import CommandeSerializer


class CommandesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        eid = request.auth.get("entreprise_id")
        limit = int(request.query_params.get("limit", 10))
        statut = request.query_params.get("statut", None)
        qs = Commande.objects.filter(entreprise_id=eid).select_related("client", "livreur").order_by("-created_at")
        if statut:
            qs = qs.filter(statut=statut)
        return Response(CommandeSerializer(qs[:limit], many=True).data)
