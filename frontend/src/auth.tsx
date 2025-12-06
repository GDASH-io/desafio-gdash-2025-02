import { useState } from "react";
import { useTheme } from "./lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, ArrowLeft, Loader2 } from "lucide-react";
import { RequestEmail, RequestLogin, RequestRegister } from "./lib/client";

export default function AuthPage() {
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    const result = await RequestEmail({email: email})
    if (result && result.goToStep != undefined) {
      setStep(result.goToStep)
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await RequestLogin({email: email, password: password})
    if (result && result.goToPage != undefined) {
      window.location.href = result.goToPage
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await RequestRegister({email: email, password: password, name: name})
    if (result && result.goToPage != undefined) {
      window.location.href = result.goToPage
    }
    setIsLoading(false);
  };

  const goBack = () => {
    setStep("email");
    setPassword("");
    setName("");
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300
      ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 rounded-full"
        onClick={toggleTheme}>
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <Card className={`w-full max-w-md shadow-lg transition-all duration-300 border
        ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>

        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === "email" && "Bem-vindo"}
            {step === "login" && "Bem-vindo de volta"}
            {step === "register" && "Criar conta"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "email" && "Digite seu e-mail para continuar"}
            {step === "login" && "Digite sua senha para entrar"}
            {step === "register" && "Preencha seus dados para se cadastrar"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={theme === "dark" ? "bg-zinc-800 border-zinc-700" : ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continuar"}
              </Button>
            </form>
          )}

          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <span>{email}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={theme === "dark" ? "bg-zinc-800 border-zinc-700" : ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </form>
          )}

          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <span>{email}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={theme === "dark" ? "bg-zinc-800 border-zinc-700" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-reg">Senha</Label>
                <Input
                  id="password-reg"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={theme === "dark" ? "bg-zinc-800 border-zinc-700" : ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cadastrar"}
              </Button>
            </form>
          )}
        </CardContent>

        {(step === "login" || step === "register") && (
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={goBack} className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar e alterar e-mail
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}