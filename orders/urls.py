from django.urls import path

from .views import AdminOrderListView, OrderCreateView, OrderTrackView

urlpatterns = [
    path('order/create', OrderCreateView.as_view(), name='order-create'),
    path('order/track/<int:pk>', OrderTrackView.as_view(), name='order-track'),
    path('orders', AdminOrderListView.as_view(), name='orders-list'),
]
