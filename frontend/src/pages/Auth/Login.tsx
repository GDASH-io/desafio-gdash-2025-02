import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../context/AuthContext';

function Login(){
    const { loginUser, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        await loginUser({ email, password });
        // redirecionamento é feito pelo AuthContext após login
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao entrar. Tente novamente.';
        setError(message);
      }
    };

    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Acesso ao Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} aria-busy={isLoading}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Não tem conta? <a href="/signup" className="text-blue-600 hover:underline">Cadastre-se</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
    );
}

export default Login;