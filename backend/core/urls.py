from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from apps.weather.api.viewsets import WeatherInsightViewSet, WeatherLogViewSet
from core import settings
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework.authtoken.views import obtain_auth_token
from apps.accounts.api.viewsets import RegisterAPIView
from apps.accounts.api.viewsets import LoginAPIView
from apps.accounts.api.viewsets import LogoutAPIView

schema_view = get_schema_view(
    openapi.Info(
        title="Snippets API",
        default_version='v1',
        description="CART_API",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # swagger
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0),name='schema-json'), # noqa E501
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'), # noqa E501
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'), # noqa E501

    path('admin/', admin.site.urls),
    # accounts
    path('api/v1/api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api/v1/register/', RegisterAPIView.as_view(), name='register'),
    path('api/v1/login/', LoginAPIView.as_view(), name='login'),
    path('api/v1/logout/', LogoutAPIView.as_view(), name='logout'),
    # Weather logs
    path("api/v1/weather/logs/", WeatherLogViewSet.as_view({"get": "list", "post": "create"}), name="weather-logs-list"), # noqa E501
    path("api/v1/weather/logs/export.csv/", WeatherLogViewSet.as_view({"get": "export_csv"}), name="weather-logs-export-csv"), # noqa E501
    path("api/v1/weather/logs/export.xlsx/", WeatherLogViewSet.as_view({"get": "export_xlsx"}), name="weather-logs-export-xlsx"), # noqa E501
    path("api/v1/weather/logs/fetch-city/", WeatherLogViewSet.as_view({"post": "fetch_city"}), name="weather-logs-fetch-city"), # noqa E501
    # Weather insights
    path("api/v1/weather/logs/insights/", WeatherInsightViewSet.as_view({"get": "list", "post": "generate"}), name="weather-logs-insights"), # noqa E501
    path("api/v1/weather/logs/insights/latest/", WeatherInsightViewSet.as_view({"get": "latest"}), name="weather-logs-insights-latest"), # noqa E501
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )
    urlpatterns += static(
        settings.STATIC_URL, document_root=settings.STATIC_URL
    )
