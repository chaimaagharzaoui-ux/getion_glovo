from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('client', 'Client'),
        ('delivery', 'Delivery'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)
    zone = models.ForeignKey('branches.Zone', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'{self.username} ({self.role})'
