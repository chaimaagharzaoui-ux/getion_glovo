from django.db import models


class Product(models.Model):
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    price = models.FloatField()
    stock = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name} ({self.branch.name})'
