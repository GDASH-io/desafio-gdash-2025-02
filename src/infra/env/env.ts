import z from 'zod';
export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3333),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  GROQ_API_KEY: z.string(),
});
export type Env = z.infer<typeof envSchema>;
