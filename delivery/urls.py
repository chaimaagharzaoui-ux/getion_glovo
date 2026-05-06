from django.urls import path

from .views import (
    DriverAcceptView,
    DriverActiveOrderView,
    DriverCompleteView,
    DriverGainsMonthView,
    DriverGainsTodayView,
    DriverGainsWeekView,
    DriverHistoryView,
    DriverOrdersView,
    DriverRejectView,
    DriverStatusUpdateView,
    DriverUpdateLocationView,
)

urlpatterns = [
    path('driver/orders', DriverOrdersView.as_view(), name='driver-orders'),
    path('driver/orders/active', DriverActiveOrderView.as_view(), name='driver-orders-active'),
    path('driver/orders/history', DriverHistoryView.as_view(), name='driver-orders-history'),
    path('driver/accept', DriverAcceptView.as_view(), name='driver-accept'),
    path('driver/reject', DriverRejectView.as_view(), name='driver-reject'),
    path('driver/update-location', DriverUpdateLocationView.as_view(), name='driver-update-location'),
    path('driver/status', DriverStatusUpdateView.as_view(), name='driver-status-update'),
    path('driver/complete', DriverCompleteView.as_view(), name='driver-complete'),
    path('driver/gains/today', DriverGainsTodayView.as_view(), name='driver-gains-today'),
    path('driver/gains/week', DriverGainsWeekView.as_view(), name='driver-gains-week'),
    path('driver/gains/month', DriverGainsMonthView.as_view(), name='driver-gains-month'),
]
