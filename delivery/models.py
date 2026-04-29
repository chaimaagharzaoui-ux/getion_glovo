from django.db import models


class Delivery(models.Model):
    STATUS_CHOICES = (
        ('searching', 'Searching Driver'),
        ('accepted', 'Accepted'),
        ('picked_up', 'Picked Up'),
        ('delivered', 'Delivered'),
        ('rejected', 'Rejected'),
    )

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='delivery')
    delivery_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='deliveries',
        limit_choices_to={'role': 'delivery'},
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='searching')
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Delivery #{self.id} - {self.status}'
