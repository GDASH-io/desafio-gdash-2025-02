import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { KeyRound, Lock, LogIn, User } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Conecta no Backend
      const res = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      window.location.href = "/";
    } catch (error) {
      alert("Login falhou! Verifique se o Backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Acesso Restrito
          </CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              "Entrando..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Entrar
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-slate-400">
            Credenciais padrão:{" "}
            <span className="font-mono text-slate-600">admin / 123456</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
