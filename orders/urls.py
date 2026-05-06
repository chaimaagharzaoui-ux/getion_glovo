from django.urls import path

from .views import AdminOrderListView, MyOrdersListView, OrderCreateView, OrderTrackView

urlpatterns = [
    path('order/create', OrderCreateView.as_view(), name='order-create'),
    path('order/track/<int:pk>', OrderTrackView.as_view(), name='order-track'),
    path('orders', AdminOrderListView.as_view(), name='orders-list'),
    path('orders/my', MyOrdersListView.as_view(), name='my-orders-list'),
]
