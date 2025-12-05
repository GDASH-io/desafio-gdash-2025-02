import * as z from "zod";
import { UserAccount } from "../UserAccount";
import { UpdateAccount } from "../UpdateAccount";
import { DeleteAccount } from "../DeleteAccount";

export const passwordRules = z.string()
  .min(6, "Mínimo 6 carateres")
  .max(20, "Máximo 20 carateres")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Senha precisa de maiúscula, minúscula, número e símbolo")

export const updateAccountSchema = z.object({
  username: z.string()
    .min(3, "Minímo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Nome pode conter apenas letras, números e . _ -")
    .optional(),
  email: z.email("Email inválido").optional(),
  password: z.preprocess((val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    return val
  }, passwordRules.optional()
  )
});

export function AccountMenagement() {
  return (
    <article className="grid gap-3 lg:grid-cols-[minmax(0,496px)_auto]">
      <UserAccount />
      <UpdateAccount />
      <DeleteAccount />
    </article>
  )
}