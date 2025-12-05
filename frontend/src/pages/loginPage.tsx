import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.message ||
        "Falha no login. Verifique as credenciais.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fbfe] p-4 overflow-auto">
      <Card className="w-full sm:max-w-md shadow-xl md:shadow-2xl border border-gray-100/50 rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col items-center p-6 bg-white/90 border-b border-gray-50">
          <div className="mb-4 transform transition duration-700 hover:rotate-[360deg]">
            <img
              src="https://gdash.io/wp-content/uploads/2025/02/logo.gdash_.white_.png"
              alt="GDASH Logo"
              className="h-10 md:h-12 p-1.5 rounded bg-[#28364F] shadow-lg"
            />
          </div>

          <CardTitle className="text-3xl font-extrabold text-[#28364F]">
            Bem-Vindo
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Acesse sua conta para continuar
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-6 bg-white/90">
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 p-2 rounded text-center text-sm mb-6 transition duration-300 animate-in fade-in">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-600 mb-1 group-focus-within:text-[#28364F] transition duration-300"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu.email@gdash.com"
                className="focus:ring-[#50E3D2] focus:border-[#50E3D2] border-gray-300 transition duration-300"
              />
            </div>
            <div className="group">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 mb-1 group-focus-within:text-[#28364F] transition duration-300"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="************"
                className="focus:ring-[#50E3D2] focus:border-[#50E3D2] border-gray-300 transition duration-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full text-white font-bold py-2 shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-xl"
              variant={"gdash"}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
