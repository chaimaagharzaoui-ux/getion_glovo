from rest_framework import serializers

from .models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    driver_name = serializers.CharField(source='delivery_user.username', read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id',
            'order_id',
            'driver_name',
            'status',
            'current_lat',
            'current_lng',
            'accepted_at',
            'delivered_at',
        ]
