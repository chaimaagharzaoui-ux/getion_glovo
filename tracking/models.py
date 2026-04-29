from django.db import models


class DeliveryLocationLog(models.Model):
    delivery = models.ForeignKey('delivery.Delivery', on_delete=models.CASCADE, related_name='location_logs')
    lat = models.FloatField()
    lng = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
