import z from 'zod';

export const createWeatherSchema = z.object({
  temperature: z.number().min(-100).max(100),
  humidity: z.number().min(0).max(100),
  wind_speed: z.number().min(0).max(100),
  weather_description: z.string().min(1).max(100),
  rain_probability: z.number().min(0).max(100),
  fetched_at: z.string().min(1),
});
