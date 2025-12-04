import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState } from "react";
import { Cloud, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const LoginPage = () => {
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand-50 via-white to-brand-400/20 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500 mb-4">
                        <Cloud className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-500 mb-2">GDASH</h1>
                    <p className="text-gray-900">Weather Analytics Dashboard</p>
                </div>

                <Card className="border-brand-400/20 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
                        <CardDescription className="text-center">
                            Entre com suas credenciais para acessar o dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="border-brand-400/30 focus:border-brand-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input 
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="border-brand-400/30 focus:border-brand-500"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {( error as any)?.response?.data?.message || 'Erro ao fazer login. Verique suas credenciais'}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-brand-500 hover:bg-brand-700 text-white"
                                disabled={isLoading}    
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-brand-400/20">
                            <p className="text-xs text-center text-gray-900 mb-2">
                                Credenciais padrão:
                            </p>
                            <div className="bg-brand-50 p-3 rounded-md text-xs font-mono">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-900">Email:</span>
                                    <span className="text-brand-500 font-semibold">admin@gdash.com</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900">Senha:</span>
                                    <span className="text-brand-500 font-semibold">Admin123456</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-gray-900 mt-8">
                    GDASH Challenge 2025 @ Luís Victor Belo
                </p>
            </div>
        </div>
    );
};