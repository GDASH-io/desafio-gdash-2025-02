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
    humidity: z.number().min(0).max(100),
    humidity_unit: z.string(),
    wind_speed: z.number().min(0),
    wind_speed_unit: z.string(),
    condition: z.string(),
    weather_code: z.number(),
    precipitation: z.number().min(0),
    precipitation_unit: z.string(),
    rain_probability: z.number().min(0).max(100),
  }),
});

export type CreateWeatherLogInput = z.infer<typeof createWeatherLogSchema>;

export const listWeatherLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
});

export type ListWeatherLogsQuery = z.infer<typeof listWeatherLogsQuerySchema>;
