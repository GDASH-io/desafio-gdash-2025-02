import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeatherInsightsCardProps {
  insights: string;
  isLoading: boolean;
}

export function WeatherInsightsCard({
  insights,
  isLoading,
}: WeatherInsightsCardProps) {
  const hasInsights = insights && insights.trim().length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Insights de IA</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading && !hasInsights && (
          <p className="text-sm text-slate-600">Gerando insights...</p>
        )}

        {!isLoading && (
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {hasInsights
              ? insights
              : "Ainda não há dados suficientes para gerar insights climáticos."}
          </p>
        )}

        {isLoading && hasInsights && (
          <p className="mt-2 text-xs text-slate-500">
            Atualizando insight com dados mais recentes...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
