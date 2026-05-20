from django.db import models
from datetime import date

class Member(models.Model):
    card_number = models.CharField("Номер карты", max_length=20, unique=True)
    full_name = models.CharField("ФИО", max_length=100)
    phone_number = models.CharField("Телефон", max_length=20, blank=True, null=True)
    expiry_date = models.DateField("Дата окончания")
    amount_paid = models.DecimalField("Всего оплачено", max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Поля для заморозки
    is_frozen = models.BooleanField("Заморожен", default=False)
    freeze_until = models.DateField("Заморожен до", blank=True, null=True)
    days_left_before_freeze = models.IntegerField("Оставалось дней до заморозки", default=0)

    @property
    def days_left(self):
        today = date.today()
        
        # Если клиент сейчас в режиме заморозки
        if self.is_frozen:
            # Если срок заморозки автоматически истек, снимаем заморозку
            if self.freeze_until and self.freeze_until <= today:
                # Нам нужно будет обновить expiry_date в базе данных при реальном запросе,
                # но для безопасного отображения возвращаем сохраненные дни.
                return self.days_left_before_freeze
            return self.days_left_before_freeze

        # Обычный подсчет дней
        if self.expiry_date < today: 
            return 0
        return (self.expiry_date - today).days

    @property
    def status_color(self):
        """Возвращает тип клиента для фронтенда: green, yellow, red, или blue для заморозки"""
        if self.is_frozen:
            return 'blue'
        
        days = self.days_left
        if days == 0:
            return 'red'
        elif days <= 7:
            return 'yellow'
        return 'green'

    def __str__(self):
        return f"{self.full_name} ({self.card_number})"

class Payment(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField("Сумма", max_digits=10, decimal_places=2)
    plan_name = models.CharField("Тариф/Операция", max_length=100)
    date_paid = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_paid']