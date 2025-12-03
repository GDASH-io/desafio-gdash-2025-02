import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CloudSun, Lightbulb, TrendingUp } from "lucide-react";

export interface WeatherInsight {
  resumo: string;
  tendencias: string[];
  alertas: string[];
  previsao_qualitativa: string;
}
export interface WeatherInsightsCardProps {
  data: WeatherInsight;
}
export function WeatherInsightsCard({ data }: WeatherInsightsCardProps) {
  return (
    <Card className="backdrop-blur-sm  from-card to-card/95 border-border/50 shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          Insights Meteorológicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo em destaque */}
        <div className="p-4 rounded-lg bg-amber-200/40 border border-primary/20">
          <p className="text-foreground font-medium leading-relaxed">
            {data.resumo}
          </p>
        </div>

        {/* Tendências */}
        {data.tendencias.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-300" />
              <h3 className="text-lg font-semibold text-foreground">
                Tendências
              </h3>
            </div>
            <div className="space-y-2 pl-7">
              {data.tendencias.map((tendencia, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-amber-300 mt-1">•</span>
                  <span>{tendencia}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas */}
        {data.alertas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Alertas</h3>
            </div>
            <div className="space-y-2">
              {data.alertas.map((alerta, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-md bg-red-300/10 border border-destructive/20"
                >
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{alerta}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previsão Qualitativa */}
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">Previsão</h3>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <span className="text-sm text-foreground">
              {data.previsao_qualitativa}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
