from django.db import models
from datetime import date

class Member(models.Model):
    card_number = models.CharField("Номер карты", max_length=20, unique=True)
    full_name = models.CharField("ФИО", max_length=100)
    phone_number = models.CharField("Телефон", max_length=20, blank=True, null=True)
    expiry_date = models.DateField("Дата окончания")
    amount_paid = models.DecimalField("Всего оплачено", max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def days_left(self):
        today = date.today()
        if self.expiry_date < today: return 0
        return (self.expiry_date - today).days

    def __str__(self):
        return f"{self.full_name} ({self.card_number})"

class Payment(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField("Сумма", max_digits=10, decimal_places=2)
    plan_name = models.CharField("Тариф/Операция", max_length=100)
    date_paid = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_paid']