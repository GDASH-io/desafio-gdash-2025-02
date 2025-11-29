import { z } from "zod";

export const createWeatherLogSchema = z.object({
  timestamp: z.string().datetime(),
  location: z.object({
    latitude: z.string(),
    longitude: z.string(),
    city: z.string(),
    state: z.string(),
  }),
  weather: z.object({
    temperature: z.number(),
    temperature_unit: z.string(),
    humidity: z.number(),
    humidity_unit: z.string(),
    wind_speed: z.number(),
    wind_speed_unit: z.string(),
    condition: z.string(),
    weather_code: z.number(),
    precipitation: z.number(),
    precipitation_unit: z.string(),
    rain_probability: z.number(),
  }),
  received_at: z.string().optional(),
  processed_at: z.string().optional(),
});

export type CreateWeatherLogInput = z.infer<typeof createWeatherLogSchema>;

export const listWeatherLogsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  location: z.string().optional(),
});

export type ListWeatherLogsQuery = z.infer<typeof listWeatherLogsQuerySchema>;

export const exportWeatherLogsQuerySchema = z.object({
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  location: z.string().optional(),
});

export type ExportWeatherLogsQuery = z.infer<
  typeof exportWeatherLogsQuerySchema
>;

export const insightsQuerySchema = z.object({
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  location: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100)),
});

export type InsightsQueryParams = z.infer<typeof insightsQuerySchema>;
