import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast("Campos obrigatórios", {
        description: "Preencha nome, e-mail e senha para continuar.",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const fakeSuccess = true;

      if (fakeSuccess) {
        toast("Cadastro realizado com sucesso!", {
          description: "Agora você já pode fazer login no sistema.",
        });
        // navigate("/");
      } else {
        toast("Erro ao cadastrar", {
          description: "Tente novamente em alguns instantes.",
        });
      }
    }, 1200);
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="mb-2 text-center">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Cadastro
          </CardTitle>
          <CardDescription>
            Crie sua conta para acessar o sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Seu nome completo"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Crie uma senha"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="mt-2 flex flex-col items-center gap-2 text-sm">
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} Sua Empresa. Todos os direitos
            reservados.
          </div>

          <div className="flex items-center justify-center gap-1">
            <span className="text-slate-600">Já tem conta?</span>
            <Button
              type="button"
              variant="link"
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer px-1"
              onClick={handleGoToLogin}
            >
              Fazer login
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
