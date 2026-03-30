from rest_framework import serializers
from .models import Components, Categories, Locations, Giacenze


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locations
        fields = '__all__'


class ComponentSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)

    class Meta:
        model = Components
        fields = '__all__'


class GiacenzaSerializer(serializers.ModelSerializer):
    componente_nome = serializers.CharField(source='componente.nome', read_only=True)
    cassetto_nome = serializers.CharField(source='cassetto.nome', read_only=True)

    class Meta:
        model = Giacenze
        fields = '__all__'