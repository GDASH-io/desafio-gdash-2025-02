import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 👇 Importação da Logo
import gdashLogo from "../assets/gdash.png";

export function Login() {
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
      setError("Credenciais inválidas. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
      {/* --- LADO ESQUERDO (BRANDING GDASH) --- */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#151C2F] text-white overflow-hidden">
        {/* Efeito de Fundo */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#50E3C2]/20 via-[#151C2F] to-[#151C2F]"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#50E3C2]/10 via-transparent to-transparent"></div>

        {/* Logo no Topo */}
        <div className="relative z-10">
          {/* Exibindo a Logo da GDASH */}
          <img
            src={gdashLogo}
            alt="GDASH Logo"
            className="h-16 w-auto object-contain rounded-lg shadow-lg shadow-[#50E3C2]/10"
          />
        </div>

        {/* Textos de Marketing */}
        <div className="relative z-10 mb-24">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Monitoramento climático{" "}
            <span className="text-[#50E3C2]">inteligente</span> em tempo real.
          </h2>
          <ul className="space-y-4 text-lg text-gray-300">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#50E3C2]" /> Ingestão de
              dados de alta performance.
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#50E3C2]" /> Análise
              preditiva com Inteligência Artificial.
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#50E3C2]" /> Dashboards
              executivos e operacionais.
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          © {new Date().getFullYear()} GDASH Technology. Todos os direitos
          reservados.
        </div>
      </div>

      {/* --- LADO DIREITO (FORMULÁRIO) --- */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[450px] space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#151C2F]">
              Acesse sua conta
            </h2>
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
                placeholder="admin@gdash.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#50E3C2]"
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
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded animate-in fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-[#50E3C2] hover:bg-[#42cfae] text-[#151C2F] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#50E3C2]/20"
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
            className="w-full h-12 border-2 font-bold text-[#151C2F] hover:bg-gray-50 border-gray-200"
          >
            Solicitar Demonstração
          </Button>
        </div>
      </div>
    </div>
  );
}
