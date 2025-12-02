import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Exporta o tipo inferido automaticamente pelo Zod
export type LoginFormValues = z.infer<typeof loginSchema>;
