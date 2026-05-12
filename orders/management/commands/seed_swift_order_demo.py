"""
Crée zone + entreprise + succursale + produits pour tester la commande depuis la démo Swift (swift_app.jsx).

Après exécution : ouvrez une boutique (ex. Burger Palace id=1) — les produits sont chargés via GET /products?branch=1
si la succursale créée a bien l’id 1 ; sinon la démo charge GET /products et utilise la première succursale trouvée.

Usage : python manage.py seed_swift_order_demo
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from branches.models import Branch, Zone
from companies.models import Company
from products.models import Product

DEMO_PRODUCTS = [
    ("Classic Burger", 8.99, 99),
    ("Cheese Fries", 4.99, 99),
    ("Cola Drink", 2.49, 99),
    ("BBQ Chicken", 12.99, 50),
    ("Onion Rings", 3.99, 50),
    ("Milkshake", 5.49, 50),
]


class Command(BaseCommand):
    help = "Crée une succursale démo + produits pour les commandes API (/order/create)."

    @transaction.atomic
    def handle(self, *args, **options):
        zone, _ = Zone.objects.get_or_create(
            name="Casablanca",
            defaults={"traffic_level": "medium"},
        )
        company, _ = Company.objects.get_or_create(
            name="Burger Palace",
            defaults={"type": "restaurant"},
        )
        branch, created = Branch.objects.get_or_create(
            company=company,
            name="Burger Palace — Centre (démo)",
            defaults={
                "zone": zone,
                "address": "Bd Zerktouni, Casablanca",
                "latitude": 33.5731,
                "longitude": -7.5898,
            },
        )
        for name, price, stock in DEMO_PRODUCTS:
            Product.objects.update_or_create(
                branch=branch,
                name=name,
                defaults={"price": price, "stock": stock, "is_active": True},
            )
        n = Product.objects.filter(branch=branch).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Succursale id={branch.pk} ({branch.name}), {n} produits. "
                f"GET /products?branch={branch.pk} pour la démo."
            )
        )
