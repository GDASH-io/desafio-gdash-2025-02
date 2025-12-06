import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const response = isRegister
        ? await authService.register({ email, password, name })
        : await authService.login({ email, password });

      if (!response || typeof response !== "object") {
        throw new Error("Resposta inválida da API");
      }

      if (!response.access_token) {
        throw new Error("Token de acesso não recebido");
      }

      if (!response.user) {
        throw new Error("Dados do usuário não recebidos");
      }

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setToast({
        message: isRegister
          ? "Conta criada com sucesso!"
          : "Login realizado com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (err: any) {
      let errorMessage = `Erro ao ${isRegister ? "cadastrar" : "fazer login"}`;

      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else if (typeof errorData.message === "string") {
            errorMessage = errorData.message;
          }
        } else if (errorData.error) {
          errorMessage =
            typeof errorData.error === "string"
              ? errorData.error
              : errorData.error.message || errorMessage;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 401) {
        errorMessage = "Email ou senha incorretos";
      } else if (err.response?.status === 400) {
        errorMessage = errorMessage || "Dados inválidos";
      } else if (err.response?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
      }

      setToast({
        message: errorMessage,
        type: "error",
      });

      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Weather Dashboard
            </CardTitle>
            <CardDescription className="text-center">
              {isRegister
                ? "Crie sua conta"
                : "Faça login para acessar o sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? isRegister
                    ? "Cadastrando..."
                    : "Entrando..."
                  : isRegister
                  ? "Cadastrar"
                  : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setToast(null);
                  setName("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isRegister
                  ? "Já tem uma conta? Faça login"
                  : "Não tem uma conta? Cadastre-se"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
