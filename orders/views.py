import logging

from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.admin_swift_utils import is_swift_principal_admin

from .models import Order

logger = logging.getLogger(__name__)
from .realtime import schedule_broadcast_new_order_after_commit
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Connexion requise : connectez-vous en tant que client sur cette même page.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if request.user.role != 'client':
            return Response(
                {
                    'detail': (
                        f"Seuls les comptes « client » peuvent commander (vous êtes : "
                        f"{getattr(request.user, 'username', '?')} — rôle « {request.user.role} »). "
                        "Créez un compte client depuis l’app Swift ou déconnectez-vous de l’admin."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            order = serializer.save()
            # Livreurs Swift : attribution via WebSocket (`drivers_room`), pas d’assignation User delivery ici.
            schedule_broadcast_new_order_after_commit(order.pk)
        logger.info("Commande créée id=%s client=%s branch=%s", order.pk, order.client_id, order.branch_id)
        order = Order.objects.prefetch_related('items__product').select_related(
            'client', 'branch', 'swift_driver'
        ).get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderTrackView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    queryset = Order.objects.select_related('delivery__delivery_user').prefetch_related('items__product')


class AdminOrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    queryset = Order.objects.select_related('client', 'branch', 'delivery__delivery_user').prefetch_related('items')

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'admin' and is_swift_principal_admin(self.request.user):
            return queryset.order_by('-created_at')
        return queryset.none()


class MyOrdersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    queryset = Order.objects.select_related('client', 'branch', 'delivery__delivery_user').prefetch_related('items__product')

    def get_queryset(self):
        return self.queryset.filter(client=self.request.user).order_by('-created_at')
