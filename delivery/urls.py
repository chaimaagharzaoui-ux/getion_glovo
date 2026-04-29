from django.urls import path

from .views import (
    DriverAcceptView,
    DriverCompleteView,
    DriverOrdersView,
    DriverRejectView,
    DriverUpdateLocationView,
)

urlpatterns = [
    path('driver/orders', DriverOrdersView.as_view(), name='driver-orders'),
    path('driver/accept', DriverAcceptView.as_view(), name='driver-accept'),
    path('driver/reject', DriverRejectView.as_view(), name='driver-reject'),
    path('driver/update-location', DriverUpdateLocationView.as_view(), name='driver-update-location'),
    path('driver/complete', DriverCompleteView.as_view(), name='driver-complete'),
]
