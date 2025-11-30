import { z } from 'zod';

export const insightSchema = z.object({
  description: z.string(),
  activities: z.array(z.string()),
});

export type Insight = z.infer<typeof insightSchema>;
