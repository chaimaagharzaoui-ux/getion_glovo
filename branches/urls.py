from rest_framework.routers import DefaultRouter

from .views import BranchViewSet, ZoneViewSet

router = DefaultRouter()
router.register('zones', ZoneViewSet, basename='zone')
router.register('branches', BranchViewSet, basename='branch')

urlpatterns = router.urls
