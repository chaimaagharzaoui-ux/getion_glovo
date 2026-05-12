from rest_framework import serializers

from products.models import Product

from .models import Order, OrderItem


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.FloatField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'subtotal']


class OrderCreateSerializer(serializers.Serializer):
    branch_id = serializers.IntegerField()
    client_lat = serializers.FloatField(required=False)
    client_lng = serializers.FloatField(required=False)
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Order must contain at least one item.')
        return items

    def create(self, validated_data):
        request = self.context['request']
        client = request.user
        branch_id = validated_data['branch_id']
        items_data = validated_data['items']
        order = Order.objects.create(
            client=client,
            branch_id=branch_id,
            client_lat=validated_data.get('client_lat'),
            client_lng=validated_data.get('client_lng'),
            status='pending',
        )
        total = 0
        for item in items_data:
            product = Product.objects.select_for_update().get(pk=item['product_id'], branch_id=branch_id)
            qty = item['quantity']
            if product.stock < qty:
                raise serializers.ValidationError(f'Not enough stock for {product.name}.')
            product.stock -= qty
            product.save(update_fields=['stock'])
            order_item = OrderItem.objects.create(order=order, product=product, quantity=qty)
            total += order_item.subtotal
        order.total_price = total
        order.save(update_fields=['total_price'])
        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    delivery_driver = serializers.SerializerMethodField()
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    company_name = serializers.CharField(source='branch.company.name', read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'client',
            'branch',
            'branch_name',
            'company_name',
            'client_username',
            'client_email',
            'status',
            'total_price',
            'client_lat',
            'client_lng',
            'created_at',
            'items',
            'delivery_driver',
        ]

    def get_delivery_driver(self, obj):
        delivery = getattr(obj, 'delivery', None)
        if not delivery:
            return None
        return {
            'id': delivery.delivery_user_id,
            'username': delivery.delivery_user.username,
            'phone': delivery.delivery_user.phone,
            'status': delivery.status,
            'current_lat': delivery.current_lat,
            'current_lng': delivery.current_lng,
        }
