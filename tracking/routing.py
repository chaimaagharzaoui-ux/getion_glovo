from django.urls import re_path

from .consumers import DeliveryTrackingConsumer

websocket_urlpatterns = [
    re_path(r'^ws/tracking/(?P<delivery_id>\d+)/$', DeliveryTrackingConsumer.as_asgi()),
]
