from django.contrib import admin
from .models import (
    Categories, Components, Tags, TagComponents,
    Locations, Giacenze, Esperienze, EsperienzeComponents,Acquisti
)

admin.site.register(Categories)
admin.site.register(Components)
admin.site.register(Tags)
admin.site.register(TagComponents)
admin.site.register(Locations)
admin.site.register(Giacenze)
admin.site.register(Esperienze)
admin.site.register(EsperienzeComponents)
admin.site.register(Acquisti)