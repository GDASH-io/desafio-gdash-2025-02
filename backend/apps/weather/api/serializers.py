from rest_framework import serializers
from ..models import WeatherLog, WeatherInsight


class WeatherLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherLog
        fields = "__all__"


class WeatherInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherInsight
        fields = "__all__"
