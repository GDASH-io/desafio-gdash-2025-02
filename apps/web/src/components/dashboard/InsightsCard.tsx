import { InsightType } from '@repo/shared'
import { AlertTriangle, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InsightsCardProps {
  insights: InsightType[] | undefined
  onGenerateInsights: () => void
}

export function InsightsCard({ insights, onGenerateInsights }: InsightsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Insights de IA</CardTitle>
          <CardDescription>Análises automáticas baseadas nos dados climáticos</CardDescription>
        </div>
        <Button size="sm" onClick={onGenerateInsights}>
          Gerar Insights
        </Button>
      </CardHeader>
      <CardContent>
        {insights && insights.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((insight: InsightType, index: number) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  insight.severity === 'ALERT'
                    ? 'border-red-200 bg-red-50'
                    : insight.severity === 'WARNING'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.severity === 'ALERT' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : insight.severity === 'WARNING' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhum insight disponível. Clique em "Gerar Insights" para analisar os dados.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
