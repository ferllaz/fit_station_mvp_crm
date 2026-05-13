from rest_framework import serializers
from .models import Member, Payment

class PaymentSerializer(serializers.ModelSerializer):
    member_name = serializers.ReadOnlyField(source='member.full_name')

    class Meta:
        model = Payment
        fields = ['id', 'member', 'member_name', 'amount', 'plan_name', 'date_paid']

class MemberSerializer(serializers.ModelSerializer):
    days_left = serializers.ReadOnlyField()

    class Meta:
        model = Member
        fields = [
            'id', 'card_number', 'full_name', 'phone_number', 
            'expiry_date', 'amount_paid', 'days_left', 'created_at'
        ]