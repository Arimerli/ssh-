from rest_framework import serializers
from .models import Components, Categories, Locations, Giacenze, Tags, TagComponents, Log, Esperienze, EsperienzeComponents, Acquisti


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Components
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locations
        fields = '__all__'

class GiacenzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Giacenze
        fields = '__all__'

    def validate(self, data):
        componente = data.get('componente') or (self.instance.componente if self.instance else None)
        cassetto = data.get('cassetto') or (self.instance.cassetto if self.instance else None)

        # controlla cassetto duplicato per lo stesso componente
        qs = Giacenze.objects.filter(componente=componente, cassetto=cassetto)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "Questo componente è già presente in questo cassetto."
            )

        # controlla che la scorta sia coerente con le altre giacenze
        scorta = data.get('scorta')
        if scorta is not None:
            altre = Giacenze.objects.filter(componente=componente)
            if self.instance:
                altre = altre.exclude(pk=self.instance.pk)
            if altre.exists():
                scorte_diverse = altre.exclude(scorta=scorta)
                if scorte_diverse.exists():
                    raise serializers.ValidationError(
                        "La scorta deve essere uguale per tutte le posizioni dello stesso componente."
                )

        return data

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = '__all__'

class TagComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TagComponents
        fields = '__all__'

class LogSerializer(serializers.ModelSerializer):
    # aggiunge il nome dell'utente invece di mostrare solo l'id
    utente_nome = serializers.SerializerMethodField()

    class Meta:
        model = Log
        fields = '__all__'

    def get_utente_nome(self, obj):
        return f"{obj.utente.first_name} {obj.utente.last_name}".strip() or obj.utente.username

class EsperienzeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Esperienze
        fields = '__all__'

class EsperienzeComponentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EsperienzeComponents
        fields = '__all__'

class AcquistiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acquisti
        fields = '__all__'