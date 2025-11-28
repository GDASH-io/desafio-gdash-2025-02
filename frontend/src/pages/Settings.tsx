import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface SettingsProps {
    email: string;
    onChangePassword: (oldPass: string, newPass: string) => Promise<void>;
    collectInterval: number;
    onIntervalChange: (minutes: number) => Promise<void>;
    themeMode: string;
    onThemeChange: (mode: 'system' | 'light' | 'dark') => void;
}

export function Settings({
    email,
    onChangePassword,
    collectInterval,
    onIntervalChange,
    themeMode,
    onThemeChange,
}: SettingsProps) {
    const { notify } = useToast();
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [intervalInput, setIntervalInput] = useState(String(collectInterval));

    const meetsLength = newPass.length >= 6;
    const meetsSpecial = useMemo(() => /[^A-Za-z0-9]/.test(newPass), [newPass]);
    const isConfirmMatch = confirm.length === 0 || confirm === newPass;
    const isPasswordValid = meetsLength && meetsSpecial;

    const handlePassword = async (event: FormEvent) => {
        event.preventDefault();
        if (!isPasswordValid) {
            notify('A nova senha precisa ter pelo menos 6 caracteres e 1 caractere especial.', 'error');
            return;
        }
        if (!isConfirmMatch) {
            notify('Senha e confirmacao nao conferem', 'error');
            return;
        }
        try {
            await onChangePassword(oldPass, newPass);
            notify('Senha alterada com sucesso', 'success', 'lock');
            setOldPass('');
            setNewPass('');
            setConfirm('');
        } catch (err: any) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Erro ao alterar senha. Tente novamente.';
            const human = Array.isArray(message) ? message.join(' | ') : String(message);
            notify(human, 'error');
        }
    };

    const handleInterval = async (event: FormEvent) => {
        event.preventDefault();
        const minutes = Number(intervalInput);
        if (Number.isNaN(minutes) || minutes <= 0) {
            notify('Intervalo invalido', 'error');
            return;
        }
        await onIntervalChange(minutes);
        notify('Intervalo salvo com sucesso', 'success', 'clock');
    };

    return (
        <div className="space-y-6">
            <Card>
                <p className="text-lg font-semibold text-[var(--text)]">Perfil</p>
                <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--table-header)] text-[var(--text)] shadow-[var(--shadow-soft)]">
                        {email.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                        <p className="text-[15px] font-semibold text-[var(--text)]">{email}</p>
                        <p className="text-xs text-[var(--muted)]">Usuario autenticado</p>
                    </div>
                </div>
            </Card>

            <Card>
                <p className="text-lg font-semibold text-[var(--text)]">Alterar senha</p>
                <form className="mt-4 space-y-4" onSubmit={handlePassword}>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[var(--muted)]">Senha atual</label>
                        <Input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[var(--muted)]">Nova senha</label>
                        <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                        <div className="space-y-1 text-xs">
                            <p className={meetsLength ? 'text-green-500' : 'text-[var(--muted)]'}>
                                • Pelo menos 6 caracteres
                            </p>
                            <p className={meetsSpecial ? 'text-green-500' : 'text-[var(--muted)]'}>
                                • Pelo menos 1 caractere especial
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[var(--muted)]">Confirmar nova senha</label>
                        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                        {confirm.length > 0 && (
                            <p className={isConfirmMatch ? 'text-green-500 text-xs' : 'text-[var(--muted)] text-xs'}>
                                {isConfirmMatch ? 'Senhas conferem' : 'Senhas não conferem'}
                            </p>
                        )}
                    </div>
                    <Button type="submit">Salvar senha</Button>
                </form>
            </Card>

            <Card>
                <p className="text-lg font-semibold text-[var(--text)]">Intervalo de coleta (global)</p>
                <form className="mt-4 space-y-4" onSubmit={handleInterval}>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[var(--muted)]">Intervalo em minutos</label>
                        <Input value={intervalInput} onChange={(e) => setIntervalInput(e.target.value)} />
                        <p className="text-xs text-[var(--muted-2)]">Defina o intervalo base para todas as coletas.</p>
                    </div>
                    <Button type="submit">Salvar intervalo</Button>
                </form>
            </Card>

            <Card>
                <p className="text-lg font-semibold text-[var(--text)]">Tema</p>
                <div className="mt-4 space-y-3">
                    <label className="text-sm font-medium text-[var(--muted)]">Aparencia</label>
                    <Select value={themeMode} onValueChange={(value) => onThemeChange(value as 'system' | 'light' | 'dark')}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="system">Sistema</SelectItem>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

        </div>
    );
}
