from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from tracking.models import DeliveryLocationLog
from tracking.services import broadcast_delivery_update

from .models import Delivery
from .serializers import DeliverySerializer


class DriverOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        deliveries = Delivery.objects.filter(delivery_user=request.user).select_related('order')
        return Response(DeliverySerializer(deliveries, many=True).data)


class DriverAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can accept orders.'}, status=403)
        delivery_id = request.data.get('delivery_id')
        delivery = Delivery.objects.select_related('order').filter(
            id=delivery_id,
            delivery_user=request.user,
            status__in=['searching', 'rejected'],
        ).first()
        if not delivery:
            return Response({'detail': 'Delivery not found.'}, status=404)
        if not request.user.is_available:
            return Response({'detail': 'Driver is not available.'}, status=400)

        delivery.status = 'accepted'
        delivery.accepted_at = timezone.now()
        delivery.save(update_fields=['status', 'accepted_at'])
        request.user.is_available = False
        request.user.save(update_fields=['is_available'])
        delivery.order.status = 'in_delivery'
        delivery.order.save(update_fields=['status'])
        Notification.objects.create(
            user=delivery.order.client,
            message=f'Votre commande #{delivery.order_id} a ete acceptee par {request.user.username}.',
        )
        broadcast_delivery_update(delivery, 'accepted')
        return Response(DeliverySerializer(delivery).data)


class DriverRejectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can reject orders.'}, status=403)
        delivery_id = request.data.get('delivery_id')
        delivery = Delivery.objects.filter(id=delivery_id, delivery_user=request.user).first()
        if not delivery:
            return Response({'detail': 'Delivery not found.'}, status=404)
        delivery.status = 'rejected'
        delivery.save(update_fields=['status'])
        return Response({'detail': 'Delivery rejected.'})


class DriverUpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can update location.'}, status=403)
        delivery_id = request.data.get('delivery_id')
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        delivery = Delivery.objects.filter(id=delivery_id, delivery_user=request.user).first()
        if not delivery:
            return Response({'detail': 'Delivery not found.'}, status=404)
        delivery.current_lat = lat
        delivery.current_lng = lng
        delivery.save(update_fields=['current_lat', 'current_lng'])
        DeliveryLocationLog.objects.create(delivery=delivery, lat=lat, lng=lng)
        broadcast_delivery_update(delivery, 'location_updated')
        return Response(DeliverySerializer(delivery).data)


class DriverCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can complete orders.'}, status=403)
        delivery_id = request.data.get('delivery_id')
        delivery = Delivery.objects.select_related('order').filter(id=delivery_id, delivery_user=request.user).first()
        if not delivery:
            return Response({'detail': 'Delivery not found.'}, status=404)
        delivery.status = 'delivered'
        delivery.delivered_at = timezone.now()
        delivery.save(update_fields=['status', 'delivered_at'])
        delivery.order.status = 'completed'
        delivery.order.save(update_fields=['status'])
        request.user.is_available = True
        request.user.save(update_fields=['is_available'])
        Notification.objects.create(
            user=delivery.order.client,
            message=f'Commande #{delivery.order_id} livree avec succes.',
        )
        broadcast_delivery_update(delivery, 'delivered')
        return Response(DeliverySerializer(delivery).data, status=status.HTTP_200_OK)
