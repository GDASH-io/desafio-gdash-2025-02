import {
  BrainCircuit,
  ThermometerSun,
  AlertTriangle,
  Lightbulb,
  Loader2,
  SearchX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AiInsight } from "@/types/weatherType";

type AiInsightCardProps = {
  insight: AiInsight | null;
  isLoading: boolean;
};

export function AiInsightCard({ insight, isLoading }: AiInsightCardProps) {
  // Cria uma estrutura visual similar ao card final, mas com animações de "pulse"
  if (isLoading) {
    return (
      <Card className="h-full min-h-80 border-indigo-100 shadow-sm flex flex-col bg-white">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          {/* Ícone Skeleton */}
          <div className="h-10 w-10 rounded-full bg-indigo-50 animate-pulse" />
          <div className="space-y-2">
            {/* Título Skeleton */}
            <div className="h-5 w-40 bg-zinc-100 rounded animate-pulse" />
            <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
          </div>
        </CardHeader>

        <CardContent className="space-y-5 flex-1 flex flex-col pt-6">
          {/* Bloco de Previsão Skeleton */}
          <div className="h-24 w-full bg-indigo-50/50 rounded-xl border border-indigo-100/50 animate-pulse" />

          {/* Linhas de Texto Skeleton */}
          <div className="space-y-2.5">
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-[90%] bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-[95%] bg-zinc-100 rounded animate-pulse" />
          </div>

          {/* Rodapé de Loading */}
          <div className="mt-auto flex items-center gap-2 text-indigo-500 text-xs font-medium animate-pulse pt-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Consultando Gemini AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostra um card amigável ao invés de nada caso nã haja insight
  if (!insight) {
    return (
      <Card className="h-full min-h-80 border-dashed border-zinc-300 shadow-none bg-zinc-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-white rounded-full mb-4 shadow-sm border border-zinc-100">
          <SearchX className="h-8 w-8 text-zinc-300" />
        </div>
        <h3 className="text-zinc-900 font-semibold mb-1">Aguardando Análise</h3>
        <p className="text-zinc-500 text-sm max-w-[220px] leading-relaxed">
          Ainda não há dados suficientes para gerar insights meteorológicos.
        </p>
      </Card>
    );
  }

  const summary = insight.summary || insight.ai_summary;
  const alertMsg = insight.alert || insight.alert_message;
  const recommendation = insight.recommendation;
  const tempNextHour = insight.temperature_next_hour;
  const forecastNextHour = insight.predicted_weather_next_hour;

  return (
    <Card className="bg-linear-to-br from-white to-indigo-50/50 border-indigo-100 shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 bg-indigo-100/50 rounded-full shadow-sm border border-indigo-200/50">
          <BrainCircuit className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <CardTitle className="text-indigo-950 text-lg font-bold">
            Análise & Previsão IA
          </CardTitle>
          <p className="text-xs text-indigo-500 font-medium flex items-center gap-1">
            Fonte: {insight.source}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 flex-1 flex flex-col">
        {/* Bloco de Previsão Futura (Destaque) */}
        {(tempNextHour !== undefined || forecastNextHour) && (
          <div className="bg-white/60 p-4 rounded-xl border border-indigo-100 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Previsão Próxima Hora
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {tempNextHour !== undefined && (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-indigo-900 tracking-tight">
                    {/* Força conversão para Number antes do toFixed evitando erro de tipagem*/}
                    {Number(tempNextHour).toFixed(1)}°C
                  </span>
                  <span className="text-sm text-indigo-600 font-medium">
                    previsto
                  </span>
                </div>
              )}
              {forecastNextHour && (
                <p className="text-sm text-zinc-600 leading-snug mt-1">
                  {forecastNextHour}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resumo Geral */}
        {summary && (
          <div>
            <p className="text-zinc-700 font-medium leading-relaxed text-base">
              {summary}
            </p>
          </div>
        )}

        {/* Alerta e Recomendação (Footer do Card) */}
        <div className="mt-auto space-y-2">
          {/* Alerta (Só mostra se não for 'Normal') */}
          {alertMsg && alertMsg !== "Normal" && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded-md border border-red-100 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="font-semibold">{alertMsg}</span>
            </div>
          )}

          {/* Recomendação */}
          {recommendation && (
            <Alert className="bg-indigo-50 border-indigo-100 shadow-none py-3">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
              <AlertTitle className="text-indigo-900 font-bold text-xs mb-1">
                DICA DA IA
              </AlertTitle>
              <AlertDescription className="text-indigo-800 text-xs">
                {recommendation}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
