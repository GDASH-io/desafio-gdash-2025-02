import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Cloud, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <Cloud className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">GDASH Weather</h1>
            <p className="text-sm text-gray-400">Sistema de Monitoramento Climático</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="border-slate-600 bg-slate-700/50 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="border-slate-600 bg-slate-700/50 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked: boolean) => setRememberMe(checked)}
              />
              <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                Lembrar-me
              </Label>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? 'Entrando...' : 'ENTRAR'}
            </Button>

            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:underline"
                 onClick={(e) => { e.preventDefault(); alert('Funcionalidade em desenvolvimento'); }}>
                Esqueceu sua senha?
              </a>
            </div>

            <div className="rounded-lg border border-slate-600 bg-slate-700/30 p-3 text-center">
              <p className="text-xs text-gray-400">
                <strong>Credenciais padrão:</strong><br />
                admin@example.com / 123456
              </p>
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-gray-400 hover:text-primary">
                ← Voltar para home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}