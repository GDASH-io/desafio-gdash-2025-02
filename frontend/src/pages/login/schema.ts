import z from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z.string().min(1, "Digite a senha"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
