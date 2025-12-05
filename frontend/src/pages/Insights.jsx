// src/pages/Insights.jsx
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

function summarizeTrend(logs) {
  if (!logs || logs.length === 0) return "Não há dados suficientes para gerar um insight.";

  // usa últimas N leituras (mais recentes primeiro)
  const last = logs.slice(0, 20).map((l) => Number(l.temperature));
  if (last.length === 0) return "Dados insuficientes.";

  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const mean = avg(last).toFixed(1);
  const first = last[last.length - 1];
  const lastVal = last[0];

  const delta = (lastVal - first).toFixed(1);
  let trend = "estável";
  if (delta >= 0.5) trend = "subindo";
  if (delta <= -0.5) trend = "caindo";

  return `Tendência: ${trend}. Média das últimas ${last.length} leituras: ${mean}°C. Variação recente: ${delta}°C.`;
}

function generateNaturalInsight(logs, weather) {
  // heurística que mistura logs + clima atual
  const trend = summarizeTrend(logs);
  const current = weather?.temp ?? null;
  const wind = weather?.wind ?? null;
  let advice = "";

  if (current !== null) {
    if (current >= 30) advice += "Está quente — evite exposição prolongada ao sol. ";
    else if (current >= 22) advice += "Temperatura agradável para atividades ao ar livre. ";
    else if (current >= 15) advice += "Leve um agasalho leve à noite. ";
    else advice += "Frio — vista roupas quentes. ";
  }

  if (wind && wind >= 20) {
    advice += "Vento forte — segure objetos leves ao ar livre. ";
  }

  const summary = trend + " " + advice;
  return summary;
}

export default function Insights({ city, coords, weather }) {
  const [logs, setLogs] = useState([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/weather/logs");
        setLogs(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const generate = () => {
    setLoading(true);
    // simula "IA" local
    setTimeout(() => {
      const text = generateNaturalInsight(logs, weather);
      setInsight(text);
      setLoading(false);
    }, 450); // pequena latência para UX
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Insights Inteligentes</h2>
      <p className="text-gray-400">Gere análises automáticas baseadas nos últimos registros e no clima atual.</p>

      <div className="flex gap-3">
        <Button onClick={generate}>{loading ? "Gerando..." : "Gerar Insight"}</Button>
        <Button onClick={() => { setInsight(""); }}>Limpar</Button>
      </div>

      <div className="mt-4 bg-gray-800 border border-gray-700 rounded p-4">
        <h4 className="font-semibold">Insight</h4>
        {insight ? <p className="mt-2">{insight}</p> : <p className="text-gray-400 mt-2">Nenhum insight gerado ainda.</p>}
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Dados usados (últimos registros)</h4>
        <div className="max-h-48 overflow-auto bg-gray-900 p-3 rounded">
          {logs.length === 0 ? <p className="text-gray-400">Sem registros</p> : (
            <ul className="text-sm space-y-1">
              {logs.slice(0, 50).map(l => (
                <li key={l._id}>
                  {new Date(l.timestamp).toLocaleString()} — {l.location} — {l.temperature}°C
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
