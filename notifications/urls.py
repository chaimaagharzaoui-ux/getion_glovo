from django.urls import path

from .views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path('driver/notifications', NotificationListView.as_view(), name='driver-notifications'),
    path('driver/notifications/<int:pk>/read', NotificationMarkReadView.as_view(), name='driver-notification-read'),
]
