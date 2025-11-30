import z from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 3000)),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().optional().default('gpt-4.1-mini'),
  OPENAI_EBEDDING_MODEL: z
    .string()
    .optional()
    .default('text-embedding-3-small'),
  FALLBACK_GEMINI_API_KEY: z.string(),
  FALLBACK_GEMINI_MODEL: z.string().optional().default('gemini-2.5-flash'),
  FALLBACK_GEMINI_EMBEDDING_MODEL: z
    .string()
    .optional()
    .default('gemini-embedding-001'),
  PUBLIC_API_URL: z.url().optional(),
});

export function validate(config: Record<string, unknown>) {
  const { data, error } = envSchema.safeParse(config);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return data;
}
