import { z } from 'zod';

export const UpdateUserDto = z.object({
  name: z.string()
    .min(3, "Nome com no mínimo 3 caracteres")
    .max(20, "Nom com no máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Nome pode conter apenas letras, números e . _ -")
    .optional(),

  email: z.email("Email inválido").optional(),

  password: z.string()
    .min(8, "Senha com no mínimo 6 caracteres")
    .max(20, "Senha com no máximo 20 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Senha precisa de maiúscula, minúscula, número e símbolo")
    .optional(),
});

export type CreateUserDtoType = z.infer<typeof UpdateUserDto>;