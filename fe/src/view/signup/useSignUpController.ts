import { useAuth } from "@/app/hooks/useAuth";
import { AuthService } from "@/app/service/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

const signupSchema = z.object({
  name: z.string("Nome é obrigatório").min(4, "O nome deve ter no mínimo 4 caracteres"),
  email: z.email("Email inválido"),
  password: z
    .string("Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export function useSignUpController() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const reqData = await AuthService.signUpUser(data);
      if (!reqData) {
        toast("Não foi possível cadastrar o usuário");
        return;
      }
      signIn(reqData.token, reqData);
      navigate("/weather");
    } catch (error) {
      if(isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message || "Não foi possível cadastrar o usuário"
        );
      } else {
        toast.error("Não foi possível cadastrar o usuário");
      }
    }
  });

  return {
    form,
    onSubmit,
  }
}