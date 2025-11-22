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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { authService } from "@/services/authService";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !email || !password || !password2) {
      toast.info("Campos obrigatórios", {
        description: "Preencha todos os campos para continuar.",
      });
      return;
    }

    try {
      setIsLoading(true);

      await authService.register({
        username,
        email,
        password,
        password2,
        avatar,
      });

      toast.success("Cadastro realizado com sucesso!", {
        description: "Agora você já pode fazer login no sistema.",
      });

      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o cadastro.";

      toast.error("Erro ao cadastrar", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(null);
    }
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
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview do avatar" />
                ) : (
                  <AvatarFallback className="bg-slate-200">
                    <UserRound className="w-6 h-6 text-slate-500" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-1">
                <Label htmlFor="avatar">Avatar (opcional)</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  PNG ou JPG, de preferência até 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="seu_username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password2">Confirme a senha</Label>
              <Input
                id="password2"
                type="password"
                placeholder="Repita a senha"
                value={password2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword2(e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full cursor-pointer">
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
