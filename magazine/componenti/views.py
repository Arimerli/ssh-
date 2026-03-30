from rest_framework import viewsets
from .models import Components, Categories, Locations, Giacenze
from .serializers import ComponentSerializer, CategorySerializer, LocationSerializer, GiacenzaSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Locations.objects.all()
    serializer_class = LocationSerializer

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Components.objects.all()
    serializer_class = ComponentSerializer

class GiacenzaViewSet(viewsets.ModelViewSet):
    queryset = Giacenze.objects.all()
    serializer_class = GiacenzaSerializer
