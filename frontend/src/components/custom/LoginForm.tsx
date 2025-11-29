import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, Loader2, UserPlus, LogIn } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (token: string) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [activeTab, setActiveTab] = useState("login");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Credenciais inválidas");

      const data = await response.json();
      onLoginSuccess(data.access_token);
    } catch (err) {
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar conta");
      }

      setSuccessMsg("Conta criada com sucesso! Clique em 'Acessar Painel'.");
      
      setActiveTab("login");

    } catch (err: any) {
      setError(err.message || "Falha ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
      <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-100 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Acessar Monitor Climático
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie o monitoramento climático
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-950/50 border border-slate-800">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Nova Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="text-slate-200">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="email-login" type="email" placeholder="gdash@gdash.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)} 
                      className="pl-10 bg-slate-950/50 border-slate-700 text-slate-100 focus:border-emerald-500" required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass-login" className="text-slate-200">Senha</Label>
                  <Input 
                    id="pass-login" type="password" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-slate-100 focus:border-emerald-500" required 
                  />
                </div>
                
                {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
                {successMsg && <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center animate-in fade-in slide-in-from-top-2">{successMsg}</div>}

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><LogIn className="mr-2 h-4 w-4" /> Acessar Painel</>}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-register" className="text-slate-200">Email Profissional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="email-register" type="email" placeholder="voce@empresa.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)} 
                      className="pl-10 bg-slate-950/50 border-slate-700 text-slate-100 focus:border-blue-500" required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass-register" className="text-slate-200">Definir Senha</Label>
                  <Input 
                    id="pass-register" type="password" placeholder="Mínimo 6 caracteres" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-slate-100 focus:border-blue-500" required minLength={6} 
                  />
                </div>

                {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><UserPlus className="mr-2 h-4 w-4" /> Criar Conta</>}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}