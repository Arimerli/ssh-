from rest_framework import viewsets
from .models import Components, Categories, Locations, Giacenze, Tags, TagComponents
from .serializers import ComponentSerializer, CategorySerializer, LocationSerializer, GiacenzaSerializer, TagSerializer, TagComponentSerializer

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

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tags.objects.all()
    serializer_class = TagSerializer

class TagComponentViewSet(viewsets.ModelViewSet):
    queryset = TagComponents.objects.all()
    serializer_class = TagComponentSerializer