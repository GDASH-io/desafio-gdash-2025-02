import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from openpyxl import Workbook
from apps.weather.services.openweather import store_weather_for_city
from apps.weather.tasks import generate_insights_task
from ..models import WeatherLog, WeatherInsight
from .serializers import WeatherLogSerializer, WeatherInsightSerializer


class WeatherLogViewSet(viewsets.ModelViewSet):
    queryset = WeatherLog.objects.all()
    serializer_class = WeatherLogSerializer

    @action(detail=False, methods=["post"], url_path="fetch-city")
    def fetch_city(self, request):
        city = request.data.get("city")
        country = request.data.get("country", "BR")

        if not city:
            return Response(
                {"detail": "Campo 'city' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            log = store_weather_for_city(city_name=city, country_code=country)
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except requests.RequestException:
            return Response(
                {"detail": "Erro ao consultar a API de geocoding/clima."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = self.get_serializer(log)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
        city = request.data.get("city") or None

        # se city vier preenchida, não forço coleta automática
        force_collect = not bool(city)

        task = generate_insights_task.delay(
            hours=hours,
            force_collect=force_collect,
            city=city,
        )

        return Response(
            {
                "detail": "Tarefa de geração de insight enviada.",
                "task_id": str(task.id),
                "city": city,
                "hours": hours,
            },
            status=status.HTTP_202_ACCEPTED,
        )
