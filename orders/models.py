from django.db import models


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_delivery', 'In Delivery'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    client = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='orders')
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='orders')
    swift_driver = models.ForeignKey(
        'driver.Driver',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='swift_orders',
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    total_price = models.FloatField(default=0)
    client_lat = models.FloatField(null=True, blank=True)
    client_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def product_name(self):
        items = list(self.items.all()) if self.pk else []
        if not items:
            return "—"
        return ", ".join(i.product.name for i in items)

    @property
    def delivery_address(self):
        if not self.branch_id:
            return "—"
        addr = (self.branch.address or "").strip() or "—"
        if self.client_lat is not None and self.client_lng is not None:
            return f"{addr} (coords {self.client_lat:.5f}, {self.client_lng:.5f})"
        return addr

    def __str__(self):
        return f'Order {self.id} - {self.status}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField()

    @property
    def subtotal(self):
        return self.product.price * self.quantity
