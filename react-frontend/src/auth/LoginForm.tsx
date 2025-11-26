import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-[#0D1117]">
      <Card className="w-full max-w-sm bg-[#161B22] border-[#1F2937] text-[#E5E7EB] shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-[#E5E7EB] text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-[#E5E7EB]">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="bg-[#0D1117] text-[#E5E7EB] border-[#1F2937] placeholder:text-[#6B7280]"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-[#E5E7EB]">Senha</label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="bg-[#0D1117] text-[#E5E7EB] border-[#1F2937] placeholder:text-[#6B7280]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-[#9CA3AF]">
            Não tem uma conta?{" "}
            <a href="/register" className="underline text-[#3B82F6] hover:text-[#3B82F6]/80">
              Cadastre-se
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
