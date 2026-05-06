from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from tracking.models import DeliveryLocationLog
from tracking.services import broadcast_delivery_update

from .models import Delivery
from .serializers import DeliverySerializer


class DriverActiveOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        delivery = Delivery.objects.filter(
            delivery_user=request.user,
            status__in=['searching', 'accepted', 'picked_up'],
        ).select_related('order').order_by('-id').first()
        if not delivery:
            return Response(None, status=200)
        return Response(DeliverySerializer(delivery).data)


class DriverOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        deliveries = (
            Delivery.objects.filter(delivery_user=request.user)
            .select_related('order', 'order__branch', 'order__client')
            .prefetch_related('order__items__product')
        )
        return Response(DeliverySerializer(deliveries, many=True).data)


class DriverHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        status_filter = request.query_params.get('status')
        deliveries = (
            Delivery.objects.filter(delivery_user=request.user)
            .select_related('order', 'order__branch', 'order__client')
            .prefetch_related('order__items__product')
            .order_by('-id')
        )
        if status_filter == 'done':
            deliveries = deliveries.filter(status='delivered')
        elif status_filter == 'cancel':
            deliveries = deliveries.filter(status='rejected')
        return Response(DeliverySerializer(deliveries, many=True).data)


class DriverGainsTodayView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        today = timezone.localdate()
        qs = Delivery.objects.filter(delivery_user=request.user, status='delivered', delivered_at__date=today).select_related('order')
        total = sum((d.order.total_price or 0) * 0.12 for d in qs)
        return Response({'livraisons': qs.count(), 'gains': round(total, 2), 'note': 4.8})


class DriverGainsWeekView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        today = timezone.localdate()
        items = []
        total = 0
        for offset in range(6, -1, -1):
            day = today - timedelta(days=offset)
            qs = Delivery.objects.filter(delivery_user=request.user, status='delivered', delivered_at__date=day).select_related('order')
            amount = round(sum((d.order.total_price or 0) * 0.12 for d in qs), 2)
            total += amount
            items.append({'jour': day.strftime('%a'), 'montant': amount, 'livraisons': qs.count(), 'isToday': day == today})
        return Response({'jours': items, 'total': round(total, 2)})


class DriverGainsMonthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can access this endpoint.'}, status=403)
        now = timezone.now()
        qs = Delivery.objects.filter(
            delivery_user=request.user,
            status='delivered',
            delivered_at__year=now.year,
            delivered_at__month=now.month,
        ).select_related('order')
        gross = sum(d.order.total_price or 0 for d in qs)
        net = gross * 0.12
        return Response({'total': round(net, 2), 'livraisons': qs.count(), 'gross': round(gross, 2), 'commission': 12})


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


class DriverStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        if request.user.role != 'delivery':
            return Response({'detail': 'Only delivery users can update status.'}, status=403)
        delivery_id = request.data.get('delivery_id')
        new_status = request.data.get('status')
        if new_status not in ['accepted', 'picked_up', 'delivered']:
            return Response({'detail': 'Invalid status.'}, status=400)
        delivery = Delivery.objects.select_related('order').filter(id=delivery_id, delivery_user=request.user).first()
        if not delivery:
            return Response({'detail': 'Delivery not found.'}, status=404)
        delivery.status = new_status
        fields = ['status']
        if new_status == 'accepted' and not delivery.accepted_at:
            delivery.accepted_at = timezone.now()
            fields.append('accepted_at')
        if new_status == 'picked_up':
            delivery.picked_up_at = timezone.now()
            fields.append('picked_up_at')
        if new_status == 'delivered':
            delivery.delivered_at = timezone.now()
            fields.append('delivered_at')
            request.user.is_available = True
            request.user.save(update_fields=['is_available'])
            delivery.order.status = 'completed'
            delivery.order.save(update_fields=['status'])
        elif new_status in ['accepted', 'picked_up']:
            delivery.order.status = 'in_delivery'
            delivery.order.save(update_fields=['status'])
        delivery.save(update_fields=fields)
        broadcast_delivery_update(delivery, f'status_{new_status}')
        return Response(DeliverySerializer(delivery).data)
