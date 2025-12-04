import { useState } from "react";
import { registerUser } from "./authService";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de enviar.",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        variant: "destructive",
        title: "E-mail inválido",
        description: "Insira um e-mail válido.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password);

      toast({
        title: "Conta criada!",
        description: "Agora faça login para continuar.",
      });

      navigate("/");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: err.response?.data?.message || "Erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-10 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-800">Criar Conta</h2>
          <p className="text-sm text-gray-500">Cadastre-se e acesse seu painel de clima</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nome completo</label>
            <Input
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <Input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <PasswordInput
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            className="w-full py-5 text-base bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "Criando..." : "Registrar →"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <Link to="/" className="text-blue-600 font-medium underline">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
