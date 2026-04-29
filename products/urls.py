from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ProductListView, ProductManagementViewSet

router = DefaultRouter()
router.register('manage/products', ProductManagementViewSet, basename='product-manage')

urlpatterns = [
    path('products', ProductListView.as_view(), name='products-list'),
]

urlpatterns += router.urls
