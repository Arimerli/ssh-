from django.db import models


class Categories(models.Model):
    nome = models.CharField(max_length=255)
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    def __str__(self):
        return self.nome

    class Meta:
        managed = False
        db_table = 'categories'


class Components(models.Model):
    nome = models.CharField(max_length=255)
    categoria = models.ForeignKey(
        Categories,
        models.DO_NOTHING,
        db_column='categoria'
    )
    pezzi = models.IntegerField()
    link = models.CharField(max_length=255)

    def __str__(self):
        return self.nome

    class Meta:
        managed = False
        db_table = 'components'


class Esperienze(models.Model):
    nome = models.CharField(max_length=255)
    descrizione = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome

    class Meta:
        managed = False
        db_table = 'esperienze'


class EsperienzeComponents(models.Model):
    esperienza = models.ForeignKey(Esperienze, models.DO_NOTHING)
    component = models.ForeignKey(Components, models.DO_NOTHING)

    def __str__(self):
        return f"{self.esperienza} — {self.component}"

    class Meta:
        managed = False
        db_table = 'esperienze_components'


class Giacenze(models.Model):
    componente = models.ForeignKey(Components, models.DO_NOTHING)
    cassetto = models.ForeignKey('Locations', models.DO_NOTHING)
    quantita = models.IntegerField()
    min_quantita = models.IntegerField()
    scorta = models.BooleanField()

    def __str__(self):
        return f"{self.componente} — {self.cassetto}"

    class Meta:
        managed = False
        db_table = 'giacenze'


class Locations(models.Model):
    nome = models.CharField(max_length=255)
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    def __str__(self):
        return self.nome

    class Meta:
        managed = False
        db_table = 'locations'


class TagComponents(models.Model):
    tag = models.ForeignKey('Tags', models.DO_NOTHING)
    component = models.ForeignKey(Components, models.DO_NOTHING)

    def __str__(self):
        return f"{self.tag} — {self.component}"

    class Meta:
        managed = False
        db_table = 'tag_components'


class Tags(models.Model):
    caratteristica = models.CharField(max_length=255)

    def __str__(self):
        return self.caratteristica

    class Meta:
        managed = False
        db_table = 'tags'


class Users(models.Model):
    nome = models.CharField(max_length=255)
    cognome = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    permessi = models.IntegerField()

    def __str__(self):
        return f"{self.nome} {self.cognome}"

    class Meta:
        managed = False
        db_table = 'users'


class Acquisti(models.Model):
    componente = models.ForeignKey(Components, models.DO_NOTHING)
    quantita = models.IntegerField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.componente} — {self.quantita} pz"

    class Meta:
        db_table = 'acquisti'
        ordering = ['-data']


class Log(models.Model):
    utente = models.ForeignKey('auth.User', models.DO_NOTHING)
    azione = models.CharField(max_length=255)
    oggetto = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'log'
        ordering = ['-timestamp']