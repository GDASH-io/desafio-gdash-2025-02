import { useAuth } from "@/app/hooks/useAuth";
import { AuthService } from "@/app/service/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const signInSchema = z.object({
  email: z.email("Email inválido"),
  password: z
    .string("Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export function useSignInController() {
  const { signIn } = useAuth();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "admin@gmail.com",
      password: "admin123",
    }
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const reqData = await AuthService.signInUser(data);

      if (!reqData) {
        toast.error("Não foi possível realizar o login");
        return;
      }
      
      signIn(reqData.token, reqData.user);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message || "Não foi possível realizar o login"
        );
      } else {
        toast.error("Não foi possível realizar o login");
      }
    }
  });

  return {
    form,
    onSubmit
  }
}
