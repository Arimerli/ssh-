# importa il modulo admin di Django
from django.contrib import admin

# importa tutti i tuoi modelli
from .models import (
    Categories, Components, Tags, TagComponents,
    Locations, Giacenze, Esperienze, EsperienzeComponents
)

# registra ogni modello nell'admin
# questo dice a Django di mostrarlo nel pannello
admin.site.register(Categories)
admin.site.register(Components)
admin.site.register(Tags)
admin.site.register(TagComponents)
admin.site.register(Locations)
admin.site.register(Giacenze)
admin.site.register(Esperienze)
admin.site.register(EsperienzeComponents)