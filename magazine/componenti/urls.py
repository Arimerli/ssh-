from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'components', views.ComponentViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'giacenze', views.GiacenzaViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'tag-components', views.TagComponentViewSet)

urlpatterns = router.urls