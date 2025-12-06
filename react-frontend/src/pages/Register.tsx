import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/users', {
        name,
        email,
        password,
        typer_usuario: 'U', //padrão usuareio
      });
      
      toast.success('Cadastro realizado com sucesso!');
      navigate('/login');

    } catch (err: any) {
      console.error('Falha no cadastro:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao realizar o cadastro. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">

        {/**header */}

        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Cadastro</CardTitle>
          <CardDescription>Crie sua conta para acessar o painel GDASH</CardDescription>
        </CardHeader>
        
        {/**FORM */}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirme a Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </CardContent>

            {/**RODAPE */}
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="underline hover:text-primary">
                Faça o login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}