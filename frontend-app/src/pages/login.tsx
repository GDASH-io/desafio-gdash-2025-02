import { useState } from "react";
import { api } from "../service/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { useLogin } from "@/hooks/useAuth";

export function Login() {
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gdash.com"); 
  const [password, setPassword] = useState("admin123");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
        await login({ email, password });
    } catch (err) {
        console.error("Falha no login");
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Acesso GDASH</CardTitle>
          <CardDescription>Entre com suas credenciais de administrador.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@gdash.com" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}