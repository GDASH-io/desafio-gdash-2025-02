import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { api, type InsightResponse } from "@/services/api";

interface InsightPanelProps {
  token: string;
  selectedDate: string; 
}

export function InsightPanel({ token, selectedDate }: InsightPanelProps) {
  const [insightData, setInsightData] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Reseta o insight se a data mudar, para forçar uma nova análise
  useEffect(() => {
    setInsightData(null);
  }, [selectedDate]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Passa a data selecionada para a API
      const data = await api.getInsight(token, selectedDate);
      setInsightData(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar insight.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-3 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-indigo-950">Inteligência Artificial</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!insightData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground max-w-[90%]">
              Solicite à IA uma análise detalhada dos padrões do dia <b>{selectedDate.split('-').reverse().join('/')}</b>.
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {loading ? "Processando..." : "Gerar Análise do Dia"}
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center text-sm">
                <Sparkles className="w-3 h-3 mr-2 text-indigo-500" /> Análise do Dia {selectedDate.split('-').reverse().join('/')}:
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {insightData.insight}
              </p>
            </div>
            
            <div className="flex justify-between items-center text-xs text-indigo-400">
              <span>{insightData.logs_analyzed} logs analisados</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setInsightData(null)}
                className="text-indigo-600 hover:text-indigo-800 h-auto p-0 hover:bg-transparent"
              >
                Nova Análise
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}