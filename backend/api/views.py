from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Member, Payment
from .serializers import MemberSerializer, PaymentSerializer

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('-created_at')
    serializer_class = MemberSerializer

    # Фикс: Возвращаем метод поиска карты для страницы "Контроль"
    @action(detail=False, methods=['get'])
    def check_card(self, request):
        card_no = request.query_params.get('no')
        if not card_no:
            return Response({"error": "Введите номер карты"}, status=status.HTTP_400_BAD_REQUEST)
        
        member = Member.objects.filter(card_number=card_no).first()
        if member:
            serializer = self.get_serializer(member)
            return Response(serializer.data)
        
        return Response({"error": "Клиент не найден"}, status=status.HTTP_404_NOT_FOUND)

    # Логика создания платежа при регистрации
    def perform_create(self, serializer):
        member = serializer.save()
        amount = self.request.data.get('amount_paid', 0)
        
        if amount and float(amount) > 0:
            Payment.objects.create(
                member=member,
                amount=amount,
                plan_name="Первичная регистрация"
            )

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all().order_by('-date_paid')
    serializer_class = PaymentSerializer