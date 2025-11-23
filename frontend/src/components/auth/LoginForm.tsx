import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginFormProps = {
  onSwitchMode: () => void;
};

export function LoginForm({ onSwitchMode }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[450px] space-y-8 animate-in slide-in-from-left-8 duration-500">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-[#151C2F]">Acesse sua conta</h2>
        <p className="text-gray-500 mt-2">
          Entre com suas credenciais para continuar.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email Corporativo
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#50E3C2]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700">
              Senha
            </Label>
            <a
              href="#"
              className="text-sm font-medium text-[#50E3C2] hover:underline"
            >
              Esqueceu a senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#50E3C2]"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold bg-[#50E3C2] cursor-pointer hover:bg-[#42cfae] text-[#151C2F] shadow-lg shadow-[#50E3C2]/20 transition-all hover:scale-[1.01]"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Entrar na Plataforma"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <span className="relative z-10 bg-white px-2 text-gray-500">
          Ainda não tem acesso?
        </span>
      </div>

      <Button
        variant="outline"
        onClick={onSwitchMode}
        className="w-full h-12 border-2 font-bold bg-[#151C2F] cursor-pointer text-white border-[#151C2F] hover:bg-transparent hover:text-[#151C2F] hover:border-transparent flex items-center gap-2 justify-center transition-all"
      >
        <UserPlus className="h-4 w-4" /> Criar Nova Conta
      </Button>
    </div>
  );
}
