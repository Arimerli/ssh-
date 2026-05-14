from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import logout, update_session_auth_hash
from django.contrib.auth.models import User, Group
from django.core.mail import send_mail
from django.conf import settings
from .models import Components, Categories, Locations, Giacenze, Tags, TagComponents, Log, Esperienze, EsperienzeComponents, Acquisti
from .serializers import ComponentSerializer, CategorySerializer, LocationSerializer, GiacenzaSerializer, TagSerializer, TagComponentSerializer, LogSerializer, EsperienzeSerializer, EsperienzeComponentsSerializer, AcquistiSerializer
from django.views.decorators.csrf import csrf_exempt
import random
import string

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

    def perform_create(self, serializer):
        categoria = serializer.save()
        salva_log(self.request.user, 'Aggiunta', f'Categoria: {categoria.nome}')

    def perform_update(self, serializer):
        categoria = serializer.save()
        salva_log(self.request.user, 'Modificata', f'Categoria: {categoria.nome}')

    def perform_destroy(self, instance):
        salva_log(self.request.user, 'Eliminata', f'Categoria: {instance.nome}')
        instance.delete()

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Locations.objects.all()
    serializer_class = LocationSerializer

    def perform_create(self, serializer):
        location = serializer.save()
        salva_log(self.request.user, 'Aggiunta', f'Posizione: {location.nome}')

    def perform_update(self, serializer):
        location = serializer.save()
        salva_log(self.request.user, 'Modificata', f'Posizione: {location.nome}')

    def perform_destroy(self, instance):
        salva_log(self.request.user, 'Eliminata', f'Posizione: {instance.nome}')
        instance.delete()

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Components.objects.all()
    serializer_class = ComponentSerializer

    def perform_create(self, serializer):
        componente = serializer.save()
        salva_log(self.request.user, 'Aggiunto', f'Componente: {componente.nome}')

    def perform_update(self, serializer):
        componente = serializer.save()
        salva_log(self.request.user, 'Modificato', f'Componente: {componente.nome}')

    def perform_destroy(self, instance):
        nome = instance.nome
        Giacenze.objects.filter(componente=instance).delete()
        TagComponents.objects.filter(component=instance).delete()
        salva_log(self.request.user, 'Eliminato', f'Componente: {nome}')
        instance.delete()

class GiacenzaViewSet(viewsets.ModelViewSet):
    queryset = Giacenze.objects.all()
    serializer_class = GiacenzaSerializer

    def perform_create(self, serializer):
        giacenza = serializer.save()
        salva_log(self.request.user, 'Aggiunta', f'Giacenza componente id:{giacenza.componente.nome}')

    def perform_update(self, serializer):
        giacenza = serializer.save()
        salva_log(self.request.user, 'Modificata', f'Giacenza componente: {giacenza.componente.nome}')

    def perform_destroy(self, instance):
        salva_log(self.request.user, 'Eliminata', f'Giacenza componente: {instance.componente.nome}')
        instance.delete()

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tags.objects.all()
    serializer_class = TagSerializer

    def perform_create(self, serializer):
        tag = serializer.save()
        salva_log(self.request.user, 'Aggiunto', f'Tag: {tag.caratteristica}')

    def perform_update(self, serializer):
        tag = serializer.save()
        salva_log(self.request.user, 'Modificato', f'Tag: {tag.caratteristica}')

    def perform_destroy(self, instance):
        salva_log(self.request.user, 'Eliminato', f'Tag: {instance.caratteristica}')
        instance.delete()

class TagComponentViewSet(viewsets.ModelViewSet):
    queryset = TagComponents.objects.all()
    serializer_class = TagComponentSerializer

    def perform_create(self, serializer):
        tc = serializer.save()
        salva_log(self.request.user, 'Aggiunto', f'Tag {tc.tag.caratteristica} al componente {tc.component.nome}')

    def perform_destroy(self, instance):
        salva_log(self.request.user, 'Rimosso',
                  f'Tag {instance.tag.caratteristica} dal componente {instance.component.nome}')
        instance.delete()

class LogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [IsAuthenticated]

class EsperienzeViewSet(viewsets.ModelViewSet):
    queryset = Esperienze.objects.all()
    serializer_class = EsperienzeSerializer

class EsperienzeComponentsViewSet(viewsets.ModelViewSet):
    queryset = EsperienzeComponents.objects.all()
    serializer_class = EsperienzeComponentsSerializer

    def get_queryset(self):
        queryset = EsperienzeComponents.objects.all()
        esperienza = self.request.query_params.get('esperienza')
        if esperienza:
            queryset = queryset.filter(esperienza_id=esperienza)
        return queryset

class AcquistiViewSet(viewsets.ModelViewSet):
    queryset = Acquisti.objects.all()
    serializer_class = AcquistiSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def utente_corrente(request):
    utente = request.user
    gruppo = utente.groups.first()
    return Response({
        'id': utente.id,
        'username': utente.username,
        'nome': utente.first_name,
        'cognome': utente.last_name,
        'email': utente.email,
        'ruolo': gruppo.name if gruppo else None,
    })

@api_view(['POST'])
#@csrf_exempt
def utente_logout(request):
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambia_password(request):
    utente = request.user
    vecchia = request.data.get('vecchia_password')
    nuova = request.data.get('nuova_password')

    if not utente.check_password(vecchia):
        return Response({'error':'Password attuale non corretta'}, status=400)

    utente.set_password(nuova)
    utente.save()

    update_session_auth_hash(request, utente)
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request, user_id):
    gruppo = request.user.groups.first()
    if not gruppo or gruppo.name not in ['Amministratore']:
        return Response({'errore': 'Non autorizzato'}, status=403)

    try:
        utente = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'errore': 'Utente non trovato'}, status=404)

    password_temp = ''.join(random.choices(string.ascii_letters + string.digits + '!@#$', k=10))
    utente.set_password(password_temp)
    utente.save()

    if utente.email:
        send_mail(
            subject='Reset password — AjaksInventory',
            message=f'Salve {utente.first_name},\n\nLa tua password è stata resettata dall\'amministratore.\n\nPassword temporanea: {password_temp}\n\nAccedi e cambiala subito dalla pagina Impostazioni.\n\nAjaksInventory — ITI E. Fermi Modena',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[utente.email],
        )

    return Response({
        'success': True,
        'password_temporanea': password_temp
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def aggiorna_profilo(request):
    utente = request.user
    email = request.data.get('email')

    utente.email = email
    utente.save()

    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crea_utente(request):
    gruppo = request.user.groups.first()
    if not gruppo or gruppo.name not in ['Amministratore']:
        return Response({'errore': 'Non autorizzato'}, status=403)

    email = request.data.get('email')
    ruolo = request.data.get('ruolo')
    password_temp = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

    try:
        parte_locale = email.split('@')[0]
        parti = parte_locale.split('.')
        cognome = parti[0].capitalize()
        nome = parti[1].capitalize() if len(parti) > 1 else ''
    except:
        nome = ''
        cognome = ''

    username = email

    if User.objects.filter(username=username).exists():
        return Response({'errore': 'Utente già esistente'}, status=400)

    utente = User.objects.create_user(
        username=username,
        email=email,
        first_name=nome,
        last_name=cognome,
        password=password_temp,
    )

    from django.contrib.auth.models import Group
    try:
        gruppo_ruolo = Group.objects.get(name=ruolo)
        utente.groups.add(gruppo_ruolo)
    except Group.DoesNotExist:
        pass

    if email:
        send_mail(
            subject='Benvenuto su AjaksInventory',
            message=f'Salve {nome} {cognome},\n\nIl tuo account è stato creato.\n\nPassword temporanea: {password_temp}\n\nAccedi con la tua email istituzionale e cambia la password dalla pagina Impostazioni.\n\nAjaksInventory — ITI E. Fermi Modena',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

    return Response({'success': True})

def salva_log(utente, azione, oggetto):
    Log.objects.create(
        utente=utente,
        azione=azione,
        oggetto=oggetto,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_utenti(request):
    gruppo = request.user.groups.first()
    if not gruppo or gruppo.name != 'Amministratore':
        return Response({'errore': 'Non autorizzato'}, status=403)

    utenti = User.objects.all().prefetch_related('groups')
    data = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'groups': [{'name': g.name} for g in u.groups.all()],
    } for u in utenti]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def aggiorna_profilo(request):
    user = request.user
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not email:
        return Response({'errore': 'Email obbligatoria'}, status=400)

    if User.objects.filter(email=email).exclude(id=user.id).exists():
        return Response({'errore': 'Email già in uso'}, status=400)

    user.email = email
    user.username = email
    user.first_name = first_name
    user.last_name = last_name
    user.save()

    return Response({'success': True})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def aggiorna_utente(request, pk):
    if not request.user.groups.filter(name="Amministratore").exists():
        return Response(status=403)

    user = User.objects.get(id=pk)

    email = request.data.get("email")
    ruolo = request.data.get("ruolo")

    if email:
        user.email = email
        user.username = email

        try:
            parte = email.split("@")[0]
            cognome, nome = parte.split(".")
            user.first_name = nome.capitalize()
            user.last_name = cognome.capitalize()
        except:
            pass

    if ruolo:
        user.groups.clear()
        try:
            group = Group.objects.get(name=ruolo)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass

    user.save()

    return Response({"success": True})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def elimina_utente(request, pk):
    if not request.user.groups.filter(name='Amministratore').exists():
        return Response({'errore': 'Non autorizzato'}, status=403)

    try:
        user = User.objects.get(id=pk)
        user.delete()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'errore': 'Utente non trovato'}, status=404)

@csrf_exempt
@api_view(['POST'])
def richiedi_reset_password(request):
    email = request.data.get('email')

    try:
        utente = User.objects.get(username=email)
    except User.DoesNotExist:
        return Response({'success': True})

    gruppo = utente.groups.first()
    amministratore = gruppo and gruppo.name == 'Amministratore'

    if amministratore:
        password_temp = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        utente.set_password(password_temp)
        utente.save()
        send_mail(
            subject='Reset password - AjaksInventory',
            message=f"Salve{utente.first_name},\nquella che segue è il reset della password da lei richiesto: \n{password_temp}\n si raccomanda di cambiarla immediatamente dalla pagina impostazioni una volta entrato, \n AjaksInventory - ITIS E. Fermi Modena",
            from_email = settings.DEFAULT_FROM_EMAIL,
            recipient_list = [email],
        )
    else:
        admin = User.objects.filter(groups__name='Amministratore').first()
        if admin and admin.email:
            send_mail(
                subject='Richiesta reset password - AjaksInventory',
                message=f'Salve, \nutente {utente.first_name} {utente.last_name} ({email}) ha richiesto il reset della password. \nAjaksInventory - ITIS E. Fermi Modena',
                from_email = settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
            )
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crea_posizione_completa(request):
    tipo = request.data.get('tipo')
    nome = request.data.get('nome')
    parent_id = request.data.get('parent_id')

    if tipo == 'cassetto':
        parent = Locations.objects.get(id=parent_id) if parent_id else None
        cassetto = Locations.objects.create(nome=nome, parent=parent)
        salva_log(request.user, 'Aggiunta', f'Posizione: {nome}')
        return Response({'success': True, 'id': cassetto.id})

    elif tipo == 'scaffale':
        parent = Locations.objects.get(id=parent_id) if parent_id else None
        scaffale = Locations.objects.create(nome=nome, parent=parent)
        salva_log(request.user, 'Aggiunto', f'Scaffale: {nome}')
        num_cassetti = int(request.data.get('num_cassetti', 0))
        for i in range(1, num_cassetti + 1):
            nome_cassetto = f"Cassetto {str(i).zfill(2)}"
            Locations.objects.create(nome=nome_cassetto, parent=scaffale)
        return Response({'success': True, 'id': scaffale.id})

    elif tipo == 'laboratorio':
        lab = Locations.objects.create(nome=nome, parent=None)
        salva_log(request.user, 'Aggiunto', f'Laboratorio: {nome}')
        scaffali_data = request.data.get('scaffali', [])
        for i, s in enumerate(scaffali_data, 1):
            nome_scaffale = f"Scaffale {i}"
            scaffale = Locations.objects.create(nome=nome_scaffale, parent=lab)
            num_cassetti = int(s.get('num_cassetti', 0))
            for j in range(1, num_cassetti + 1):
                nome_cassetto = f"Cassetto {str(j).zfill(2)}"
                Locations.objects.create(nome=nome_cassetto, parent=scaffale)
        return Response({'success': True, 'id': lab.id})

    return Response({'errore': 'Tipo non valido'}, status=400)


