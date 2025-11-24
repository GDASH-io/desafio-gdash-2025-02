from django.contrib import admin
from .models import WeatherLog, WeatherInsight


@admin.register(WeatherLog)
class WeatherLogAdmin(admin.ModelAdmin):
    list_display = (
        "timestamp",
        "city",
        "temperature",
        "humidity",
        "pressure",
        "wind_speed",
        "condition",
        "created_at",
    )
    list_filter = ("city", "condition", "timestamp", "created_at")
    search_fields = ("city", "condition")
    date_hierarchy = "timestamp"
    ordering = ("-timestamp",)
    readonly_fields = ("created_at",)


@admin.register(WeatherInsight)
class WeatherInsightAdmin(admin.ModelAdmin):
    list_display = ("generated_at", "short_text")
    date_hierarchy = "generated_at"
    ordering = ("-generated_at",)

    readonly_fields = ("generated_at",)

    def short_text(self, obj):
        return (obj.text[:75] + "...") if len(obj.text) > 75 else obj.text

    short_text.short_description = "Insight"
