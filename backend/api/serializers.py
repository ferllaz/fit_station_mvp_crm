from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    # Указываем, что days_left — это поле только для чтения (вычисляется в модели)
    days_left = serializers.ReadOnlyField()

    class Meta:
        model = Member
        fields = [
            'id', 
            'card_number', 
            'full_name', 
            'expiry_date', 
            'days_left', 
            'created_at'
        ]

    # Валидация: директор оценит, если система не даст создать карту с датой в прошлом
    def validate_expiry_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Нельзя зарегистрировать абонемент, который уже истек!")
        return value