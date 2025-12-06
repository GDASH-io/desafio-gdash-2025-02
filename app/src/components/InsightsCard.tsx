import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { WeatherInsight } from "@/types/weather";

interface InsightsCardProps {
  insights: WeatherInsight | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export function InsightsCard({
  insights,
  isLoading,
  onRegenerate,
}: InsightsCardProps) {
  if (!insights) return null;

  const getTrendIcon = (direction: string) => {
    if (direction === "rising") return <TrendingUp className="h-4 w-4" />;
    if (direction === "falling") return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getAlertIcon = (type: string) => {
    if (type === "danger") return <AlertCircle className="h-5 w-5" />;
    if (type === "warning") return <AlertTriangle className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };

  const hasTrends =
    insights.trends &&
    Array.isArray(insights.trends) &&
    insights.trends.length > 0 &&
    typeof insights.trends[0] === "object" &&
    insights.trends[0].metric;

  const hasAlerts =
    insights.alerts &&
    Array.isArray(insights.alerts) &&
    insights.alerts.length > 0;

  const hasRecommendations =
    insights.recommendations &&
    Array.isArray(insights.recommendations) &&
    insights.recommendations.length > 0;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle>Insights de IA</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Regenerar
          </Button>
        </div>
        <CardDescription>{insights.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trends */}
        {hasTrends && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">Tendências</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {insights.trends.map((trend: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-lg bg-white border"
                >
                  <div className="mt-0.5">{getTrendIcon(trend.direction)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">
                      {trend.metric.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trend.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {hasAlerts && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">Alertas</h4>
            <div className="space-y-2">
              {insights.alerts.map((alert: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alert.type === "danger"
                      ? "bg-red-50 border-red-200"
                      : alert.type === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {hasRecommendations && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">Recomendações</h4>
            <ul className="space-y-1">
              {insights.recommendations.map((rec: any, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-right">
          Gerado em: {new Date(insights.generatedAt).toLocaleString("pt-BR")}
        </p>
      </CardContent>
    </Card>
  );
}
