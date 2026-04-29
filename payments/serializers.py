from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    amount = serializers.FloatField(source='order.total_price', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'method', 'status', 'paid_at']
        read_only_fields = ['id', 'status', 'paid_at', 'amount']
