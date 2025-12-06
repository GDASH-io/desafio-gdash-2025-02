import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { WeatherLog } from "@/services/weather";

export interface ChartDataPoint {
  time: string;
  temperatura: number;
  sensacao: number;
}

export interface PrecipitationDataPoint {
  time: string;
  probabilidade: number;
}

type ProcessedLog = {
  log: WeatherLog;
  date: Date;
  timestamp: number;
  hora: number;
  temperatura: number;
  sensacao: number;
  time: string;
};

export function processTemperatureData(logs: WeatherLog[]): ChartDataPoint[] {
  const processedLogs: ProcessedLog[] = logs
    .filter((log) => log && log.timestamp && log.current)
    .map((log) => {
      try {
        const date = new Date(log.timestamp);
        if (isNaN(date.getTime())) {
          return null;
        }
        const hora = date.getHours();
        const temperatura = Number(log.current.temperature) || 0;
        const sensacao = temperatura;

        return {
          log,
          date,
          timestamp: date.getTime(),
          hora,
          temperatura,
          sensacao,
          time: format(date, "HH:mm", { locale: ptBR }),
        };
      } catch {
        return null;
      }
    })
    .filter(
      (item): item is ProcessedLog => item !== null && item.temperatura > 0
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  if (processedLogs.length === 0) return [];

  const horasAlvo = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  const logsPorHora = new Map<number, ProcessedLog[]>();

  processedLogs.forEach((item) => {
    const hora = item!.hora;
    if (!logsPorHora.has(hora)) {
      logsPorHora.set(hora, []);
    }
    logsPorHora.get(hora)!.push(item!);
  });

  const filteredData: ProcessedLog[] = [];
  const logsUsados = new Set<number>();

  horasAlvo.forEach((horaAlvo) => {
    if (logsPorHora.has(horaAlvo)) {
      const logsNaHora = logsPorHora.get(horaAlvo)!;
      const logSelecionado = logsNaHora[logsNaHora.length - 1];
      if (logSelecionado && !logsUsados.has(logSelecionado.timestamp)) {
        filteredData.push(logSelecionado);
        logsUsados.add(logSelecionado.timestamp);
      }
    } else {
      let melhorLog: ProcessedLog | null = null;
      let menorDiferenca = Infinity;

      processedLogs.forEach((item) => {
        if (!item || logsUsados.has(item.timestamp)) {
          return;
        }
        const diferenca = Math.abs(item.hora - horaAlvo);
        if (diferenca <= 1 && diferenca < menorDiferenca) {
          menorDiferenca = diferenca;
          melhorLog = item;
        }
      });

      if (melhorLog !== null) {
        const log = melhorLog as ProcessedLog;
        if (!logsUsados.has(log.timestamp)) {
          filteredData.push(log);
          logsUsados.add(log.timestamp);
        }
      }
    }
  });

  const logsToUse = filteredData.length >= 3 ? filteredData : processedLogs;

  const uniqueLogs = new Map<number, ProcessedLog>();
  logsToUse.forEach((item) => {
    if (!uniqueLogs.has(item!.timestamp)) {
      uniqueLogs.set(item!.timestamp, item);
    }
  });

  const finalData = Array.from(uniqueLogs.values()).sort(
    (a, b) => a!.timestamp - b!.timestamp
  );

  return finalData.map((item) => ({
    time: item!.time,
    temperatura: item!.temperatura,
    sensacao: item!.sensacao,
  }));
}

export function processPrecipitationData(
  latestLog: WeatherLog | undefined
): PrecipitationDataPoint[] {
  if (!latestLog) {
    return [];
  }

  if (!latestLog.forecast) {
    return [];
  }

  if (!latestLog.forecast.hourly || !Array.isArray(latestLog.forecast.hourly)) {
    return [];
  }

  if (latestLog.forecast.hourly.length === 0) {
    return [];
  }

  const processed = latestLog.forecast.hourly
    .slice(0, 24)
    .map((hourly) => {
      try {
        if (!hourly || !hourly.time) {
          return null;
        }
        const date = new Date(hourly.time);
        if (isNaN(date.getTime())) {
          return null;
        }
        const probabilidade =
          hourly.precipitation_probability !== null &&
          hourly.precipitation_probability !== undefined
            ? Number(hourly.precipitation_probability)
            : 0;

        if (isNaN(probabilidade)) {
          return null;
        }

        return {
          time: format(date, "HH:mm", { locale: ptBR }),
          probabilidade: probabilidade,
        };
      } catch (error) {
        return null;
      }
    })
    .filter((item) => item !== null) as PrecipitationDataPoint[];

  return processed;
}
