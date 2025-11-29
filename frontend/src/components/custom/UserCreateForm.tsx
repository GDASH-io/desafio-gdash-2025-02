import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock } from 'lucide-react';

interface UserCreateFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

export function UserCreateForm({ onSuccess, onClose }: UserCreateFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const token = localStorage.getItem("gdash_token");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar usuário.');
            }

            onSuccess();
            onClose(); 
        } catch (err: any) {
            setError(err.message || 'Erro de rede ou permissão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="email" type="email" placeholder="novo.usuario@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-slate-950/50 border-slate-700 text-slate-100" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-slate-950/50 border-slate-700 text-slate-100" required minLength={6} />
                </div>
            </div>
            
            {error && <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
            </Button>
        </form>
    );
}