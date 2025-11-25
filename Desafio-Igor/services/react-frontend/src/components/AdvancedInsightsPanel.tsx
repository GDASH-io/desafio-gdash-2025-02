import React, { useState } from "react";
import {
  Info,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Cloud,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { api } from "../api";
import "./AdvancedInsightsPanel.css";

interface Evidence {
  titulo: string;
  conteudo: string;
  fonte: string;
  relevancia: number;
}

interface AdvancedInsight {
  resumo_geral: string;
  classificacao_momento: string;
  nivel_conforto_termico: "baixo" | "moderado" | "alto" | "muito_alto";
  risco_para_grupos_sensiveis: "baixo" | "moderado" | "alto" | "muito_alto";
  tendencia_temperatura: "queda" | "estavel" | "subida" | "indefinida";
  tendencia_chuva:
    | "sem_chuva_relevante"
    | "instabilidade_moderada"
    | "alta_chance_chuva";
  alertas: string[];
  recomendacoes_praticas: string[];
  evidencias?: Evidence[];
}

const AdvancedInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<AdvancedInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvancedInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/weather/insights/advanced?limit=20");
      setInsights(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erro ao gerar insights avançados"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "subida":
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case "queda":
        return <TrendingDown className="w-5 h-5 text-blue-500" />;
      case "estavel":
        return <Minus className="w-5 h-5 text-gray-500" />;
      default:
        return <Cloud className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConfortLabel = (nivel: string) => {
    const labels = {
      muito_alto: "Muito Desconfortável",
      alto: "Desconfortável",
      moderado: "Moderado",
      baixo: "Confortável",
    };
    return labels[nivel as keyof typeof labels] || nivel;
  };

  const getRiskLabel = (risco: string) => {
    const labels = {
      muito_alto: "Muito Alto",
      alto: "Alto",
      moderado: "Moderado",
      baixo: "Baixo",
    };
    return labels[risco as keyof typeof labels] || risco;
  };

  return (
    <div className="card advanced-insights-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="advanced-insights-icon">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="advanced-insights-title">Análise Avançada com IA</h2>
            <p className="advanced-insights-subtitle">
              Powered by OpenAI + Vector Store
            </p>
          </div>
        </div>
        <button
          onClick={fetchAdvancedInsights}
          disabled={loading}
          className="advanced-insights-btn"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Analisando...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Gerar Análise</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="insight-resumo">
            <div className="flex items-start gap-3">
              <div className="insight-resumo-icon">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Resumo Geral</h3>
                <p>{insights.resumo_geral}</p>
              </div>
            </div>
          </div>

          {/* Classificação e Métricas */}
          <div className="metrics-grid">
            {/* Classificação do Momento */}
            <div className="metric-card">
              <h4>
                <Cloud className="w-5 h-5 text-blue-500" />
                Classificação
              </h4>
              <p>{insights.classificacao_momento}</p>
            </div>

            {/* Conforto Térmico */}
            <div
              className={`metric-card ${
                insights.nivel_conforto_termico === "muito_alto"
                  ? "risk-very-high"
                  : insights.nivel_conforto_termico === "alto"
                  ? "risk-high"
                  : insights.nivel_conforto_termico === "moderado"
                  ? "risk-moderate"
                  : "risk-low"
              }`}
            >
              <h4>
                <Info className="w-5 h-5" />
                Conforto Térmico
              </h4>
              <p>{getConfortLabel(insights.nivel_conforto_termico)}</p>
            </div>

            {/* Risco para Grupos Sensíveis */}
            <div
              className={`metric-card ${
                insights.risco_para_grupos_sensiveis === "muito_alto"
                  ? "risk-very-high"
                  : insights.risco_para_grupos_sensiveis === "alto"
                  ? "risk-high"
                  : insights.risco_para_grupos_sensiveis === "moderado"
                  ? "risk-moderate"
                  : "risk-low"
              }`}
            >
              <h4>
                <AlertCircle className="w-5 h-5" />
                Risco (Grupos Sensíveis)
              </h4>
              <p>{getRiskLabel(insights.risco_para_grupos_sensiveis)}</p>
            </div>

            {/* Tendência de Temperatura */}
            <div className="metric-card">
              <h4>
                {getTrendIcon(insights.tendencia_temperatura)}
                Tendência de Temperatura
              </h4>
              <p className="capitalize">{insights.tendencia_temperatura}</p>
            </div>
          </div>

          {/* Alertas */}
          {insights.alertas && insights.alertas.length > 0 && (
            <div className="alerts-section">
              <h4>
                <AlertTriangle className="w-5 h-5" />
                Alertas
              </h4>
              <ul>
                {insights.alertas.map((alerta, index) => (
                  <li key={index}>
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{alerta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomendações */}
          {insights.recomendacoes_praticas &&
            insights.recomendacoes_praticas.length > 0 && (
              <div className="recommendations-section">
                <h4>
                  <Info className="w-5 h-5" />
                  Recomendações Práticas
                </h4>
                <ul>
                  {insights.recomendacoes_praticas.map((rec, index) => (
                    <li key={index}>
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Evidências */}
          {insights.evidencias && insights.evidencias.length > 0 && (
            <div className="evidence-section">
              <div className="evidence-header">
                <div className="evidence-icon">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4>Evidências Científicas</h4>
                  <p>Conhecimento recuperado do Vector Store</p>
                </div>
              </div>
              <div>
                {insights.evidencias.map((evidencia, index) => (
                  <div key={index} className="evidence-item">
                    <div className="flex items-start gap-3">
                      <div className="evidence-number">{index + 1}</div>
                      <div className="flex-1 evidence-content">
                        <h5>{evidencia.titulo}</h5>
                        <p>{evidencia.conteudo}</p>
                        <div className="evidence-meta">
                          <span className="evidence-source">
                            <Info className="w-3 h-3" />
                            {evidencia.fonte}
                          </span>
                          <span className="evidence-relevance">
                            {(evidencia.relevancia * 100).toFixed(0)}%
                            relevância
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!insights && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h3>Pronto para análise profunda?</h3>
          <p>
            Clique em "Gerar Análise" para obter insights avançados baseados em
            nossa base de conhecimento meteorológico
          </p>
          <div className="empty-state-info">
            <Info size={16} />
            <span>Utiliza Vector Store com IA</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedInsightsPanel;
