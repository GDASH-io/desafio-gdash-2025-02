from rest_framework import serializers
from ..models import WeatherLog, WeatherInsight


class WeatherLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherLog
        fields = "__all__"
        extra_kwargs = {
            "raw": {"required": True},
        }

    def validate_raw(self, value):
        if not isinstance(value, dict) or not value:
            raise serializers.ValidationError(
                "Campo 'raw' é obrigatório e não pode ser vazio."
            )
        return value


class WeatherInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherInsight
        fields = "__all__"
