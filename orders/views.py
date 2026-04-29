from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from delivery.services import assign_order_to_next_driver

from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'client':
            return Response({'detail': 'Only clients can create orders.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            order = serializer.save()
            assign_order_to_next_driver(order)
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
        if self.request.user.role == 'admin':
            return queryset.order_by('-created_at')
        return queryset.none()
from django.shortcuts import render

# Create your views here.
