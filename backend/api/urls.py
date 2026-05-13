from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'members', MemberViewSet, basename='member')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]