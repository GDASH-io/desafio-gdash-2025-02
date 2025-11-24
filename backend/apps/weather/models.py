from django.db import models


class WeatherLog(models.Model):
    timestamp = models.DateTimeField()
    city = models.CharField(max_length=128)
    temperature = models.FloatField()
    humidity = models.FloatField()
    pressure = models.FloatField()
    wind_speed = models.FloatField()
    condition = models.CharField(max_length=255)
    raw = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.city} - {self.timestamp:%d/%m %H:%M}"


class WeatherInsight(models.Model):
    generated_at = models.DateTimeField(auto_now_add=True)
    text = models.TextField()

    def __str__(self):
        return f"Insight {self.generated_at:%d/%m %H:%M}"
