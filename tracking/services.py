from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast_delivery_update(delivery, event_type):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    payload = {
        'event': event_type,
        'delivery_id': delivery.id,
        'order_id': delivery.order_id,
        'status': delivery.status,
        'current_lat': delivery.current_lat,
        'current_lng': delivery.current_lng,
        'driver_id': delivery.delivery_user_id,
    }
    async_to_sync(channel_layer.group_send)(
        f'delivery_{delivery.id}',
        {
            'type': 'delivery_update',
            'data': payload,
        },
    )
