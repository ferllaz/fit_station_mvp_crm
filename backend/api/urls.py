from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, PaymentViewSet, TrainerViewSet

router = DefaultRouter()
router.register(r'members', MemberViewSet, basename='member')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'trainers', TrainerViewSet, basename='trainer')

urlpatterns = [
    path('', include(router.urls)),
]
