from rest_framework import generics, permissions, viewsets

from .models import Product
from .serializers import ProductSerializer
from users.permissions import IsManagerOrAdmin


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True, stock__gt=0)
        branch_id = self.request.query_params.get('branch')
        zone_id = self.request.query_params.get('zone')
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if zone_id:
            queryset = queryset.filter(branch__zone_id=zone_id)
        return queryset


class ProductManagementViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('branch', 'branch__zone').order_by('id')
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrAdmin]
