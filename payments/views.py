from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from users.permissions import IsClient

from .models import Payment
from .serializers import PaymentSerializer


class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request):
        order_id = request.data.get('order_id')
        method = request.data.get('method', 'cash')
        order = Order.objects.filter(id=order_id, client=request.user).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        payment, _ = Payment.objects.get_or_create(order=order, defaults={'method': method})
        if payment.status == 'paid':
            return Response({'detail': 'Order already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        payment.method = method
        payment.status = 'paid'
        payment.paid_at = timezone.now()
        payment.save(update_fields=['method', 'status', 'paid_at'])
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
