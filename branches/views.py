from rest_framework import viewsets

from users.permissions import IsManagerOrAdmin

from .models import Branch, Zone
from .serializers import BranchSerializer, ZoneSerializer


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.order_by('name')
    serializer_class = ZoneSerializer
    permission_classes = [IsManagerOrAdmin]


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.select_related('company', 'zone').order_by('id')
    serializer_class = BranchSerializer
    permission_classes = [IsManagerOrAdmin]
