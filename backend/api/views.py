from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Member, Payment
from .serializers import MemberSerializer, PaymentSerializer
from datetime import timedelta, date
from django.db.models import Case, When, Value, IntegerField

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('-created_at')
    serializer_class = MemberSerializer

    # 1. Автоматическая проверка разморозки при просмотре списка
    def get_queryset(self):
        today = date.today()
        # Если срок заморозки вышел, автоматически размораживаем клиентов
        expired_freezes = Member.objects.filter(is_frozen=True, freeze_until__lte=today)
        for member in expired_freezes:
            member.expiry_date = today + timedelta(days=member.days_left_before_freeze)
            member.is_frozen = False
            member.freeze_until = None
            member.save()
        seven_days_later = today + timedelta(days=7)
        return Member.objects.annotate(
            status_order=Case(
                When(is_frozen=False, expiry_date__gt=today, expiry_date__lte=seven_days_later, then=Value(0)),
                When(is_frozen=True, then=Value(1)),
                default=Value(2),
                output_field=IntegerField(),
            )
        ).order_by('status_order', '-created_at')

    # Контроль доступа
    @action(detail=False, methods=['get'])
    def check_card(self, request):
        card_no = request.query_params.get('no')
        if not card_no:
            return Response({"error": "Введите номер карты"}, status=status.HTTP_400_BAD_REQUEST)
        
        member = Member.objects.filter(card_number=card_no).first()
        if member:
            # Проверяем, не заморожен ли он при проходе
            if member.is_frozen:
                return Response({
                    "id": member.id,
                    "card_number": member.card_number,
                    "full_name": member.full_name,
                    "days_left": 0,
                    "phone_number": member.phone_number,
                    "expiry_date": str(member.expiry_date),
                    "is_frozen": True,
                    "freeze_until": str(member.freeze_until) if member.freeze_until else None,
                    "status_color": member.status_color,
                    "error_message": "АБОНЕМЕНТ ЗАМОРОЖЕН"
                })
            serializer = self.get_serializer(member)
            return Response(serializer.data)
        return Response({"error": "Клиент не найден"}, status=status.HTTP_404_NOT_FOUND)

    # 2. Метод Заморозки
    @action(detail=True, methods=['post'])
    def freeze(self, request, pk=None):
        member = self.get_object()
        until_date = request.data.get('freeze_until')
        
        if not until_date:
            return Response({"error": "Укажите дату окончания заморозки"}, status=status.HTTP_400_BAD_REQUEST)
        
        if member.days_left <= 0:
            return Response({"error": "Нельзя заморозить истекший абонемент"}, status=status.HTTP_400_BAD_REQUEST)

        member.days_left_before_freeze = member.days_left
        member.is_frozen = True
        member.freeze_until = until_date
        member.save()

        return Response({"status": "success", "message": f"Клиент {member.full_name} успешно заморожен до {until_date}."})

    # 3. Метод Разморозки (Досрочной)
    @action(detail=True, methods=['post'])
    def unfreeze(self, request, pk=None):
        member = self.get_object()
        if not member.is_frozen:
            return Response({"error": "Клиент не был заморожен"}, status=status.HTTP_400_BAD_REQUEST)

        today = date.today()
        # Возвращаем дни, отсчитывая от сегодняшнего дня
        member.expiry_date = today + timedelta(days=member.days_left_before_freeze)
        member.is_frozen = False
        member.freeze_until = None
        member.save()

        return Response({"status": "success", "message": f"Клиент {member.full_name} досрочно разморожен. Новый срок до: {member.expiry_date}"})

    # 4. Ручка для получения уведомлений (желтые клиенты)
    @action(detail=False, methods=['get'])
    def notifications(self, request):
        today = date.today()
        seven_days_later = today + timedelta(days=7)
        
        # Выбираем тех, у кого дата окончания между сегодня и через 7 дней, и кто не заморожен
        expiring_members = Member.objects.filter(
            expiry_date__gt=today, 
            expiry_date__lte=seven_days_later,
            is_frozen=False
        )
        
        data = [{
            "id": m.id,
            "full_name": m.full_name,
            "days_left": (m.expiry_date - today).days,
            "phone_number": m.phone_number
        } for m in expiring_members]
        
        return Response(data)

    # Продление абонемента
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        member = self.get_object()
        days = int(request.data.get('days', 30))
        amount = float(request.data.get('amount', 25000))
        plan_name = request.data.get('plan_name', f"Продление ({days} дн.)")

        today = date.today()
        if member.is_frozen:
            return Response({"error": "Сначала разморозьте клиента!"}, status=status.HTTP_400_BAD_REQUEST)

        if member.expiry_date < today:
            member.expiry_date = today + timedelta(days=days)
        else:
            member.expiry_date = member.expiry_date + timedelta(days=days)

        member.amount_paid = float(member.amount_paid) + amount
        member.save()

        Payment.objects.create(member=member, amount=amount, plan_name=plan_name)
        return Response({"status": "success", "message": f"Абонемент продлен до {member.expiry_date}"})

    def perform_create(self, serializer):
        member = serializer.save()
        amount = self.request.data.get('amount_paid', 0)
        if amount and float(amount) > 0:
            Payment.objects.create(member=member, amount=amount, plan_name="Первичная регистрация")

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all().order_by('-date_paid')
    serializer_class = PaymentSerializer
