from rest_framework import serializers

from .models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    driver_name = serializers.CharField(source='delivery_user.username', read_only=True)
    order_total = serializers.FloatField(source='order.total_price', read_only=True)
    order_created_at = serializers.DateTimeField(source='order.created_at', read_only=True)
    client_lat = serializers.FloatField(source='order.client_lat', read_only=True)
    client_lng = serializers.FloatField(source='order.client_lng', read_only=True)
    pickup_address = serializers.CharField(source='order.branch.address', read_only=True)
    branch_name = serializers.CharField(source='order.branch.name', read_only=True)
    branch_lat = serializers.FloatField(source='order.branch.latitude', read_only=True)
    branch_lng = serializers.FloatField(source='order.branch.longitude', read_only=True)
    client_username = serializers.CharField(source='order.client.username', read_only=True)
    order_items = serializers.SerializerMethodField()
    delivery_fee = serializers.SerializerMethodField()
    eta_label = serializers.SerializerMethodField()

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
            'picked_up_at',
            'delivered_at',
            'order_total',
            'order_created_at',
            'client_lat',
            'client_lng',
            'pickup_address',
            'branch_name',
            'branch_lat',
            'branch_lng',
            'client_username',
            'order_items',
            'delivery_fee',
            'eta_label',
        ]

    def get_order_items(self, obj):
        return [{'name': it.product.name, 'qty': it.quantity} for it in obj.order.items.all()]

    def get_delivery_fee(self, obj):
        total = obj.order.total_price or 0
        return round(max(2.99, total * 0.06), 2)

    def get_eta_label(self, obj):
        return '25–35 min'
