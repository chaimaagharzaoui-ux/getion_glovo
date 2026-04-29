from django.urls import path

from .views import PaymentCreateView

urlpatterns = [
    path('payment/pay', PaymentCreateView.as_view(), name='payment-pay'),
]
