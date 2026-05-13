from django.db import models
from datetime import date

class Member(models.Model):
    card_number = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True) # Номер для связи
    expiry_date = models.DateField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Сколько заплатил
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def days_left(self):
        today = date.today()
        if self.expiry_date < today: return 0
        return (self.expiry_date - today).days

    def __str__(self):
        return f"{self.full_name} ({self.amount_paid} KZT)"