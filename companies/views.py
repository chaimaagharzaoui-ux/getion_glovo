from rest_framework import viewsets

from users.permissions import IsManagerOrAdmin

from .models import Company
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.order_by('-created_at')
    serializer_class = CompanySerializer
    permission_classes = [IsManagerOrAdmin]
