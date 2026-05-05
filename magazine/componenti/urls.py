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
router.register(r'log', views.LogViewSet)

urlpatterns = router.urls + [
    path('utente/', views.utente_corrente),
    path('utente/login/', TokenObtainPairView.as_view()),
    path('utente/refresh/', TokenRefreshView.as_view()),
    path('utente/logout/', views.utente_logout),
    path('utente/cambia-password/', views.cambia_password),
    path('utente/<int:user_id>/reset-password/', views.reset_password),
    path('utente/aggiorna-profilo/', views.aggiorna_profilo),
    path('utente/crea/', views.crea_utente),
    path('utenti/', views.lista_utenti),
    path('utente/aggiorna-profilo/', views.aggiorna_profilo),
    path('utenti/<int:pk>/aggiorna/', views.aggiorna_utente),
    path('utenti/<int:pk>/elimina/', views.elimina_utente),
]