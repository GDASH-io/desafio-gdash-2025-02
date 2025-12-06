import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      setUser(response.data.user);
      setToken(response.data.accessToken);

      toast({
        title: "Login realizado!",
        description: `Bem-vindo(a), ${response.data.user.name}!`,
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.response?.data?.message || "Credenciais inválidas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
