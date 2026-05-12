from django.db import models

from entreprise.models import Commande


class Driver(models.Model):
    VEHICLE_CHOICES = [
        ("voiture", "Voiture"),
        ("moto", "Moto"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    # max_length=191 : index UNIQUE compatible MySQL utf8mb4 (limite ~1000 octets sous InnoDB / WAMP)
    email = models.EmailField(unique=True, max_length=191)
    password = models.CharField(max_length=255)
    vehicle = models.CharField(max_length=20, choices=VEHICLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    compte_statut = models.CharField(
        max_length=20,
        choices=[
            ('en_attente', 'En attente'),
            ('valide', 'Validé'),
            ('suspendu', 'Suspendu'),
        ],
        default='valide',
        db_index=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class DriverOrder(models.Model):
    """Lien livreur ↔ commande client (`orders.Order`)."""

    STATUS_CHOICES = [
        ("current", "current"),
        ("delivered", "delivered"),
        ("rejected", "rejected"),
    ]

    driver = models.ForeignKey(
        Driver, on_delete=models.CASCADE, related_name="driver_orders"
    )
    order = models.ForeignKey(
        "orders.Order", on_delete=models.CASCADE, related_name="driver_order_rows"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="current")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["driver", "order"], name="unique_driver_client_order_row"
            )
        ]

    def __str__(self):
        return f"{self.driver} → {self.order_id} ({self.status})"


class DriverRejection(models.Model):
    driver = models.ForeignKey(
        Driver, on_delete=models.CASCADE, related_name="rejections"
    )
    commande = models.ForeignKey(
        Commande, on_delete=models.CASCADE, related_name="driver_rejections"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["driver", "commande"], name="unique_driver_commande_rejection"
            )
        ]


class DriverAssignment(models.Model):
    commande = models.OneToOneField(
        Commande, on_delete=models.CASCADE, related_name="driver_assignment"
    )
    driver = models.ForeignKey(
        Driver, on_delete=models.CASCADE, related_name="assignments"
    )
    accepted_at = models.DateTimeField(auto_now_add=True)


class DriverClientOrderRejection(models.Model):
    """Ancien refus API (conservé pour migrations / données existantes)."""

    driver = models.ForeignKey(
        Driver, on_delete=models.CASCADE, related_name="client_order_rejections"
    )
    order = models.ForeignKey(
        "orders.Order", on_delete=models.CASCADE, related_name="swift_driver_rejections"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["driver", "order"],
                name="unique_swift_driver_client_order_rejection",
            )
        ]
