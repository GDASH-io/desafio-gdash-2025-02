import { httpClient } from "./httpClient";

type AnalysticsFilters = {
  type: "hour" | "day";
  date?: Date;
  limit?: number;
  signal?: AbortSignal;
};

export class AnalyticsService {
  static async getTemperatureAnalytics({
    type,
    date,
    limit,
    signal
  }: AnalysticsFilters) {
    try {
      const { data, status } =
        await httpClient.get<AnalyticsService.GetTemperatureAnalyticsOutput>(
          `/analytics/temperature?type=${type}&date=${
            date ? date.toISOString() : undefined
          }&limit=${limit === 0 ? undefined : limit}`,
          {
            signal
          }
        );

      return status === 200 ? data.analytics : undefined;
    } catch {
      return [];
    }
  }

  static async getWindSpeedAnalytics({ type, date, limit, signal }: AnalysticsFilters) {
    try {
      const { data, status } =
        await httpClient.get<AnalyticsService.GetWindSpeedAnalyticsOutput>(
          `/analytics/wind-speed?type=${type}&date=${
            date ? date.toISOString() : undefined
          }&limit=${limit === 0 ? undefined : limit}`,
          {
            signal
          }
        );
      return status === 200 ? data.analytics : undefined;
    } catch {
      return [];
    }
  }

  static async getComparativeAnalytics({
    type,
    date,
    limit,
    signal
  }: AnalysticsFilters) {
    try {
      const { data, status } =
        await httpClient.get<AnalyticsService.GetComparativeAnalyticsOutput>(
          `/analytics/comparative?type=${type}&date=${
            date ? date.toISOString() : undefined
          }&limit=${limit === 0 ? undefined : limit}`,
          {
            signal
          }
        );
      return status === 200 ? data.analytics : undefined;
    } catch {
      return [];
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AnalyticsService {
  export type GetTemperatureAnalyticsOutput = {
    analytics: {
      hour: string;
      temperature: number;
    }[];
  };

  export type GetWindSpeedAnalyticsOutput = {
    analytics: {
      hour: string;
      windSpeed: number;
    }[];
  };

  export type GetComparativeAnalyticsOutput = {
    analytics: {
      hour: string;
      temperature: number;
      windSpeed: number;
    }[];
  };
}
