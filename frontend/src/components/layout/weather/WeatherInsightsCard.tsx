import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WeatherInsightsCardProps {
  insights: string;
  isLoading: boolean;
  onGenerate?: () => void;
}

export function WeatherInsightsCard({
  insights,
  isLoading,
  onGenerate,
}: WeatherInsightsCardProps) {
  const hasInsights = insights && insights.trim().length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Insights de IA</CardTitle>

        {onGenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isLoading}
          >
            {isLoading ? "Gerando..." : "Gerar insight"}
          </Button>
        )}
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
