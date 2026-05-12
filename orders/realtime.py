"""Diffusion temps réel des commandes client vers le groupe Channels `drivers_room`."""

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast_new_order_to_drivers(order):
    """
    Après création d'une `orders.Order`, notifie tous les livreurs connectés.
    `type` Channels : `new.order` → handler `new_order` sur le consumer.
    """
    client = order.client
    client_name = (client.get_full_name() or "").strip() or client.username
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        "drivers_room",
        {
            "type": "new.order",
            "order_id": order.id,
            "client_name": client_name,
            "product": order.product_name,
            "address": order.delivery_address,
            "price": str(order.total_price),
            "time": order.created_at.strftime("%H:%M") if order.created_at else "",
        },
    )


def schedule_broadcast_new_order_after_commit(order_pk: int):
    from django.db import transaction

    def _run():
        from orders.models import Order

        order = (
            Order.objects.select_related("client", "branch")
            .prefetch_related("items__product")
            .filter(pk=order_pk)
            .first()
        )
        if order:
            broadcast_new_order_to_drivers(order)

    transaction.on_commit(_run)
