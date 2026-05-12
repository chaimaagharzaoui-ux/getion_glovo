from django.urls import re_path

from driver.consumers import ClientConsumer, DriverConsumer, OrderClientConsumer
from .consumers import DeliveryTrackingConsumer

websocket_urlpatterns = [
    re_path(r"^ws/tracking/(?P<delivery_id>\d+)/$", DeliveryTrackingConsumer.as_asgi()),
    re_path(r"^ws/driver/$", DriverConsumer.as_asgi()),
    re_path(r"^ws/client/(?P<client_id>\d+)/$", ClientConsumer.as_asgi()),
    re_path(r"^ws/order/(?P<order_id>\d+)/$", OrderClientConsumer.as_asgi()),
]
