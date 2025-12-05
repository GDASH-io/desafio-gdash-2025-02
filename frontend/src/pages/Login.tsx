import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudSun, Lock, User, Info } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Se já tiver token, manda pro dashboard
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Conecta ao Backend na porta 3000
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) throw new Error('Credenciais inválidas');

      const data = await res.json();
      
      // Salva o token e redireciona
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_name', data.user.name);
      localStorage.setItem('user_email', data.user.email)
      
      navigate('/'); // Vai para o Dashboard
    } catch (err) {
      setLoginError('Email ou senha incorretos.');
      console.log(err)
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl bg-slate-50">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <CloudSun className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-slate-900">GDASH Weather</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Entre para acessar a telemetria em tempo real
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert variant="destructive" className="py-2">
                <Info className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="admin@example.com" 
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="password"
                  placeholder="••••••" 
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Acessar Sistema'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}