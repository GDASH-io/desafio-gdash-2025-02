import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CloudSun, Lock, Mail, CheckCircle2 } from "lucide-react";

interface LoginProps {
    onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const dados = await res.json();

            if (res.ok) {
                localStorage.setItem("usuarioNome", dados.nome);
                onLogin();
            } else {
                setErro("Acesso negado. Verifique seus dados.");
            }
        } catch (error) {
            setErro("Erro ao conectar com servidor.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1965&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none"></div>

            <Card className="w-full max-w-md shadow-2xl border-none bg-white/90 backdrop-blur-sm z-10">
                <CardHeader className="space-y-1 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-blue-50 rounded-full shadow-sm">
                            <CloudSun className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-slate-800">GDASH Login</CardTitle>
                    <CardDescription className="text-slate-500">
                        Acesse o painel de monitoramento climático
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@gdash.com"
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="senha"
                                    type="password"
                                    placeholder="••••••"
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {erro && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium text-center animate-pulse border border-red-100">
                                {erro}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                            disabled={loading}
                        >
                            {loading ? "Autenticando..." : "Entrar na Plataforma"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6">
                    <div className="text-center text-xs text-slate-400">
                        <p className="mb-1 font-semibold text-slate-500">Credenciais de Acesso (Teste):</p>
                        <div className="flex justify-center gap-4">
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> admin@gdash.com</span>
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> 123456</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}