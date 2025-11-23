import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  onSwitchMode: () => void;
}

export function SignupForm({ onSwitchMode }: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await axios.post("http://localhost:3000/api/users", {
        name,
        email,
        password,
      });

      setSuccessMsg("Conta criada com sucesso! Entrando...");

      const loginResponse = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { access_token } = loginResponse.data;
      localStorage.setItem("token", access_token);

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Este email já está cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      if (!successMsg) setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[450px] space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-[#151C2F]">Crie sua conta</h2>
        <p className="text-gray-500 mt-2">Preencha os dados para começar.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">
            Nome Completo
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#50E3C2]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email Corporativo
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@gdash.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#50E3C2]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Senha
          </Label>
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

        {successMsg && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {successMsg}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold bg-[#50E3C2] hover:bg-[#42cfae] text-[#151C2F] shadow-lg shadow-[#50E3C2]/20 transition-all hover:scale-[1.01]"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Criar Conta Grátis"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <span className="relative z-10 bg-white px-2 text-gray-500">
          Já tem uma conta?
        </span>
      </div>

      <Button
        variant="outline"
        onClick={onSwitchMode}
        className="w-full h-12 border-2 font-bold bg-[#151C2F] cursor-pointer text-white border-[#151C2F] hover:bg-transparent hover:text-[#151C2F] hover:border-transparent flex items-center gap-2 justify-center transition-all"
      >
        <LogIn className="h-4 w-4" /> Voltar para Login
      </Button>
    </div>
  );
}
