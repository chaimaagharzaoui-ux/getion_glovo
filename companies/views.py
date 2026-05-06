from rest_framework import permissions, viewsets

from users.permissions import IsManagerOrAdmin

from .models import Company
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.prefetch_related('branches').order_by('-created_at')
    serializer_class = CompanySerializer
    permission_classes = [IsManagerOrAdmin]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
