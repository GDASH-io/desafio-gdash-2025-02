import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Insight } from '@/types';

interface InsightsCardProps {
  insights: Insight[];
  onGenerate: () => void;
  loading?: boolean;
}

export function InsightsCard({ insights, onGenerate, loading }: InsightsCardProps) {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'danger': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      alert: 'Alerta',
      trend: 'Tendência',
      summary: 'Resumo',
      recommendation: 'Clima',
    };
    return types[type] || type;
  };

  return (
    <Card className="border-2 border-green-100 bg-[#e6faf5]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Insights de IA</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Gerar Novos Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum insight disponível. Clique em "Gerar Novos Insights".
          </p>
        ) : (
          insights.slice(0, 5).map((insight) => (
            <div key={insight._id} className="flex items-start gap-2">
              <Badge variant={getSeverityVariant(insight.severity) as any}>
                {getTypeLabel(insight.type)}
              </Badge>
              <p className="text-sm">{insight.content}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}