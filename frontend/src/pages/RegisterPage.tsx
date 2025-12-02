import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!validatePassword(password)) {
      setError('Senha deve ter 8+ caracteres, maiúscula, minúscula, número e caractere especial');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border border-white/20 shadow-2xl">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">G-Dash</h1>
          <p className="text-white/60 text-center mb-8">Criar Conta</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nome"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <p className="text-white/40 text-xs mt-2">Min. 8 caracteres, maiúscula, minúscula, número e símbolo</p>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center mb-4">Já tem conta?</p>
            <Link to="/login">
              <Button
                type="button"
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition"
              >
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
