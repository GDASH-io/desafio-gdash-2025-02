import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, AlertTriangle } from 'lucide-react';

interface User { 
    _id: string;
    email: string;
    createdAt: string;
}

interface UserEditFormProps {
    user: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export function UserEditForm({ user, onSuccess, onCancel }: UserEditFormProps) {
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const token = localStorage.getItem("gdash_token");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const updatePayload: { email: string, password?: string } = { email };

        if (password.length > 0) {
            updatePayload.password = password;
        }

        try {
            const response = await fetch(`${API_URL}/users/${user._id}`, { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar usuário');
            }

            onSuccess(); 
        } catch (err: any) {
            setError(err.message || 'Erro de rede ou permissão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email-edit">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="email-edit" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-slate-950/50 border-slate-700 text-slate-100" required />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="password-edit">Nova Senha (Opcional)</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="password-edit" type="password" placeholder="Deixe em branco para não alterar" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-slate-950/50 border-slate-700 text-slate-100" />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className='h-3 w-3 text-yellow-500' />
                    Se preenchida, a senha será criptografada e alterada.
                </p>
            </div>
            
            {error && <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
}