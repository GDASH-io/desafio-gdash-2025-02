import z from "zod";

export const updateSchema = z.object({
  name: z.string().optional(),
  email: z.email("Email inválido").optional(),
});

export type UpdateFormData = z.infer<typeof updateSchema>;
