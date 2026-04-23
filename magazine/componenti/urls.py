from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'components', views.ComponentViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'giacenze', views.GiacenzaViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'tag-components', views.TagComponentViewSet)

urlpatterns = router.urls + [
    path('utente/', views.utente_corrente),
    path('utente/login/', TokenObtainPairView.as_view()),
    path('utente/refresh/', TokenRefreshView.as_view()),
    path('utente/logout/', views.utente_logout),
]