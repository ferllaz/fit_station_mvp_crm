from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet

# Роутер сам создаст пути для GET, POST, DELETE и PATCH
router = DefaultRouter()
router.register(r'members', MemberViewSet, basename='member')

urlpatterns = [
    path('', include(router.urls)),
]