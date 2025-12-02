import { api } from "@/lib/api";
import type { AiInsight, WeatherDataLog } from "@/types/weatherType";

export type PaginatedLogsProps = {
  data: WeatherDataLog[];
  total: number;
  page: number;
  last_page: number;
};
export const weatherService = {
  // 1. Busca o histórico de logs
  async getLogs(
    page: number = 1,
    limit: number = 10
  ): Promise<WeatherDataLog[]> {
    const { data } = await api.get<WeatherDataLog[]>("/weather/logs", {
      params: { page, limit },
    });
    return data;
  },

  // 2. Busca a análise da IA
  async getInsights(): Promise<AiInsight> {
    const { data } = await api.get<AiInsight>("/weather/insights");
    return data;
  },

  // 3. Lida com o download de arquivos (Blob)
  // Essa função cria um link invisível no navegador e clica nele
  async downloadReport(format: "csv" | "xlsx") {
    const response = await api.get(`/weather/export.${format}`, {
      responseType: "blob", // Diz pro Axios: "Isso é um arquivo, não JSON"
    });

    // Cria URL temporária para o arquivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_clima.${format}`);

    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
