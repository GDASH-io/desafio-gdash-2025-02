from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from openpyxl import Workbook
from ..models import WeatherLog, WeatherInsight
from .serializers import WeatherLogSerializer, WeatherInsightSerializer
from ..services.insights import generate_insights_for_last_hours


class WeatherLogViewSet(viewsets.ModelViewSet):
    """
    GET /api/weather/logs/          -> lista registros
    POST /api/weather/logs/         -> cria registro (pode ser usado por outros serviços) # noqa E501
    """
    queryset = WeatherLog.objects.all()
    serializer_class = WeatherLogSerializer

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        logs = self.get_queryset().order_by("timestamp")

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="weather_logs.csv"' # noqa E501

        writer = csv.writer(response)
        writer.writerow(
            ["timestamp", "city", "temperature", "humidity", "pressure", "wind_speed", "condition"] # noqa E501
        )
        for log in logs:
            writer.writerow(
                [
                    log.timestamp.isoformat(),
                    log.city,
                    log.temperature,
                    log.humidity,
                    log.pressure,
                    log.wind_speed,
                    log.condition,
                ]
            )
        return response

    @action(detail=False, methods=["get"], url_path="export-xlsx")
    def export_xlsx(self, request):
        logs = self.get_queryset().order_by("timestamp")

        wb = Workbook()
        ws = wb.active
        ws.title = "Weather Logs"
        ws.append(["timestamp", "city", "temperature", "humidity", "pressure", "wind_speed", "condition"]) # noqa E501

        for log in logs:
            ws.append(
                [
                    log.timestamp.isoformat(),
                    log.city,
                    log.temperature,
                    log.humidity,
                    log.pressure,
                    log.wind_speed,
                    log.condition,
                ]
            )

        from io import BytesIO
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type=(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" # noqa E501
            ),
        )
        response["Content-Disposition"] = 'attachment; filename="weather_logs.xlsx"' # noqa E501
        return response


class WeatherInsightViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/weather/insights/           -> lista todos
    GET /api/weather/insights/latest/    -> último insight
    POST /api/weather/insights/generate/ -> gera insight sob demanda
    """
    queryset = WeatherInsight.objects.all().order_by("-generated_at")
    serializer_class = WeatherInsightSerializer

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        insight = self.get_queryset().first()
        if not insight:
            return Response(
                {"detail": "Nenhum insight disponível ainda."},
                status=status.HTTP_204_NO_CONTENT,
            )
        serializer = self.get_serializer(insight)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        hours = int(request.data.get("hours", 24))
        from ..models import WeatherInsight

        text = generate_insights_for_last_hours(hours=hours)
        insight = WeatherInsight.objects.create(text=text)
        serializer = self.get_serializer(insight)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
