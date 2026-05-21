from rest_framework import serializers
from .models import Member, Payment, Trainer

class TrainerSerializer(serializers.ModelSerializer):
    clients_count = serializers.SerializerMethodField()

    def get_clients_count(self, obj):
        return getattr(obj, 'clients_count', 0)

    class Meta:
        model = Trainer
        fields = ['id', 'full_name', 'specialty', 'photo_url', 'is_active', 'notes', 'clients_count', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    member_name = serializers.ReadOnlyField(source='member.full_name')
    trainer_display_name = serializers.SerializerMethodField()
    trainer_display_photo = serializers.SerializerMethodField()

    def get_trainer_display_name(self, obj):
        if obj.trainer:
            return obj.trainer.full_name
        return obj.trainer_name

    def get_trainer_display_photo(self, obj):
        if obj.trainer:
            return obj.trainer.photo_url
        return obj.trainer_photo_url

    class Meta:
        model = Payment
        fields = [
            'id', 'member', 'member_name', 'trainer', 'trainer_name',
            'trainer_photo_url', 'trainer_display_name', 'trainer_display_photo',
            'amount', 'plan_name', 'date_paid'
        ]

class MemberSerializer(serializers.ModelSerializer):
    days_left = serializers.ReadOnlyField()
    status_color = serializers.ReadOnlyField() # Добавили цвет статуса

    class Meta:
        model = Member
        fields = [
            'id', 'card_number', 'full_name', 'phone_number', 
            'expiry_date', 'amount_paid', 'days_left', 'status_color',
            'is_frozen', 'freeze_until', 'created_at'
        ]
