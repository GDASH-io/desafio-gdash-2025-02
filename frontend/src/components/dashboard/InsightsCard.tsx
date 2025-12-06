import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { Insight } from '@/types';
import ReactMarkdown from 'react-markdown';

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

  // Encontrar o insight de IA (o mais recente do tipo summary com source 'Google Gemini AI')
  const aiInsight = insights.find(
    (i) => i.type === 'summary' && i.metadata?.source === 'Google Gemini AI'
  );
  const otherInsights = insights.filter((i) => i !== aiInsight);

  return (
    <div className="space-y-4">
      {/* AI Insight Card - Se existir */}
      {aiInsight && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-purple-900">{aiInsight.title}</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerate}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Gerar Nova Análise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none prose-headings:text-purple-900 prose-p:text-gray-700 prose-strong:text-purple-800">
              <ReactMarkdown>{aiInsight.content}</ReactMarkdown>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Gerado em: {new Date(aiInsight.generatedAt).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traditional Insights Card */}
      {otherInsights.length > 0 && (
        <Card className="border-2 border-green-100 bg-[#e6faf5]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Insights Complementares</CardTitle>
              </div>
              {!aiInsight && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerate}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Gerar Insights
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherInsights.slice(0, 5).map((insight) => (
              <div key={insight._id} className="flex items-start gap-2">
                <Badge variant={getSeverityVariant(insight.severity) as any}>
                  {getTypeLabel(insight.type)}
                </Badge>
                <p className="text-sm">{insight.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Insights Card */}
      {!aiInsight && otherInsights.length === 0 && (
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
                Gerar Insights
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Nenhum insight disponível. Clique em "Gerar Insights" para criar análises com IA.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}