from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Components, Categories, Locations, Giacenze, Tags, TagComponents
from .serializers import ComponentSerializer, CategorySerializer, LocationSerializer, GiacenzaSerializer, TagSerializer, TagComponentSerializer
from django.contrib.auth import logout
#from django.views.decorators.csrf import csrf_exempt

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def utente_corrente(request):
    utente = request.user
    gruppo = utente.groups.first()
    return Response({
        'id': utente.id,
        'username': utente.username,
        'ruolo': gruppo.name if gruppo else None,
    })
'''
@api_view(['POST'])
@csrf_exempt
def utente_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    utente = authenticate(request, username=username, password=password)

    if utente is not None:
        login(request,utente)
        gruppo = utente.groups.first()
        return Response({
            'success': True,
            'username': utente.username,
            'ruolo': gruppo.name if gruppo else None,
        })
    else:
        return Response({
            'success': False,
            'errore': 'Username o password errati'
        }, status=400)
'''
@api_view(['POST'])
#@csrf_exempt
def utente_logout(request):
    return Response({'success': True})