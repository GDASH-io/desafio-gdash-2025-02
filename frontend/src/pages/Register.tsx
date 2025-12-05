import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  });

  const password = watch('password');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email inválido';
    }
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return 'Confirmação de senha é obrigatória';
    }
    if (confirmPassword !== password) {
      return 'As senhas não coincidem';
    }
    return true;
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);

    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      
      // Fazer login automático após registro
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.message || 
        'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 py-8">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Logo Header */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            <img 
              src="/GDASH.png" 
              alt="GDASH Logo" 
              className="h-16 w-auto object-contain relative z-10 drop-shadow-lg mb-4"
            />
            <h1 className="text-2xl font-bold text-white relative z-10 text-center">Criar Nova Conta</h1>
            <p className="text-gray-300 text-sm mt-1 relative z-10 text-center">Preencha os dados para criar sua conta</p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  {...register('name', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter no mínimo 2 caracteres',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Nome deve ter no máximo 100 caracteres',
                    },
                  })}
                  className={`h-11 ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  {...register('email', {
                    required: 'Email é obrigatório',
                    validate: validateEmail,
                  })}
                  className={`h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    validate: validatePassword,
                  })}
                  className={`h-11 ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  {...register('confirmPassword', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: validateConfirmPassword,
                  })}
                  className={`h-11 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? 'Criando conta...' : 'Criar Conta'}
              </Button>
              <div className="text-center text-sm pt-2">
                <span className="text-gray-600">Já tem uma conta? </span>
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                  Fazer login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

