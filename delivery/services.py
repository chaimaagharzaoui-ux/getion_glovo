from notifications.models import Notification
from users.models import User

from .models import Delivery


def find_available_drivers_for_order(order):
    return User.objects.filter(
        role='delivery',
        zone=order.branch.zone,
        is_available=True,
    ).order_by('id')


def assign_order_to_next_driver(order):
    drivers = find_available_drivers_for_order(order)
    if not drivers.exists():
        return None
    driver = drivers.first()
    delivery = Delivery.objects.create(
        order=order,
        delivery_user=driver,
        status='searching',
    )
    Notification.objects.create(
        user=driver,
        message=f'Nouvelle commande #{order.id} dans votre zone.',
    )
    order.status = 'assigned'
    order.save(update_fields=['status'])
    return delivery
