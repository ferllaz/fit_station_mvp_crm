from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Member
from .serializers import MemberSerializer

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('-created_at')
    serializer_class = MemberSerializer

    # Специальный метод для поиска по номеру карты (для CheckCard.tsx)
    # Путь будет: GET /api/members/check_card/?no=ХХХ
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