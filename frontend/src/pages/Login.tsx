import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { Label } from '../components/ui/label';

export function Login() {
    const { login } = useAuth();
    const { notify } = useToast();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('123456');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            notify('Autenticado com sucesso', 'success');
        } catch (err) {
            console.error(err);
            notify('Credenciais invalidas. Verifique email e senha.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen theme-bg px-6 py-10">
            <div className="mx-auto max-w-md">
                <Card className="rounded-[12px] p-6">
                    <p className="mb-4 text-lg font-semibold text-[var(--text)]">Login</p>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label className="text-sm text-[var(--muted)]" htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                placeholder="email@exemplo.com"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-[var(--muted)]" htmlFor="password">
                                Senha
                            </Label>
                            <Input
                                id="password"
                                placeholder="Senha"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Conectando...' : 'Entrar'}
                        </Button>
                        <p className="text-xs text-[var(--muted)]">Use o usuario padrao do backend (.env).</p>
                    </form>
                </Card>
            </div>
        </div>
    );
}