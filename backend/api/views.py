from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Member, Payment
from .serializers import MemberSerializer, PaymentSerializer
from datetime import timedelta, date

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('-created_at')
    serializer_class = MemberSerializer

    # Контроль доступа (Поиск по карте)
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

    # Кастомное продление с авто-логированием денег
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        member = self.get_object()
        
        # Получаем данные из запроса (по дефолту 30 дней и 25 000 тенге)
        days = int(request.data.get('days', 30))
        amount = float(request.data.get('amount', 25000))
        plan_name = request.data.get('plan_name', f"Продление ({days} дн.)")

        today = date.today()
        
        # Если абонемент уже истек, считаем новые дни от СЕГОДНЯ
        if member.expiry_date < today:
            member.expiry_date = today + timedelta(days=days)
        # Если еще действует, то просто прибавляем дни сверху
        else:
            member.expiry_date = member.expiry_date + timedelta(days=days)

        # Плюсуем деньги в общую сумму клиента
        member.amount_paid = float(member.amount_paid) + amount
        member.save()

        # Автоматически создаем запись в истории платежей (Кассе)
        Payment.objects.create(
            member=member,
            amount=amount,
            plan_name=plan_name
        )

        return Response({
            "status": "success", 
            "message": f"Абонемент продлен до {member.expiry_date}",
            "expiry_date": member.expiry_date
        }, status=status.HTTP_200_OK)

    # Логика первичной оплаты при регистрации
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