from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Components, Categories, Locations, Giacenze, Tags, TagComponents
from .serializers import ComponentSerializer, CategorySerializer, LocationSerializer, GiacenzaSerializer, TagSerializer, TagComponentSerializer
from django.contrib.auth import logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .models import Components, Categories, Locations, Giacenze, Tags, TagComponents, Log
from .serializers import ComponentSerializer, CategorySerializer, LocationSerializer, GiacenzaSerializer, TagSerializer, TagComponentSerializer, LogSerializer
import random
import string

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

class LogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [IsAuthenticated]

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

    # ricava nome e cognome dall'email
    # es. merli.arianna@fermi.mo.it → cognome=Merli, nome=Arianna
    try:
        parte_locale = email.split('@')[0]
        parti = parte_locale.split('.')
        cognome = parti[0].capitalize()
        nome = parti[1].capitalize() if len(parti) > 1 else ''
    except:
        nome = ''
        cognome = ''

    # usa l'email come username
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