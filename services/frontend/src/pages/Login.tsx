import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudSun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Simulação de login para testes (sem chamada ao backend)
    setTimeout(async () => {
      try {
        // Simular dados do usuário
        await authLogin(data);
        toast({
          variant: 'success',
          title: 'Login realizado',
          description: 'Bem-vindo ao GDASH Weather!',
        });
        navigate('/dashboard');
      } catch (error) {
        setErrorMessage('Erro ao fazer login');
        toast({
          variant: 'destructive',
          title: 'Erro ao fazer login',
          description: 'Verifique suas credenciais e tente novamente.',
        });
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <CloudSun className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">GDASH Weather</CardTitle>
            <CardDescription className="mt-2">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Credenciais padrão:</p>
              <p className="font-mono mt-1">admin@example.com / 123456</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
