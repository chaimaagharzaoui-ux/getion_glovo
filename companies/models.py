from django.db import models


class Company(models.Model):
    COMPANY_TYPE_CHOICES = (
        ('restaurant', 'Restaurant'),
        ('pharmacy', 'Pharmacy'),
        ('store', 'Store'),
        ('other', 'Other'),
    )

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, choices=COMPANY_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
