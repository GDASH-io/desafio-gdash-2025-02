import { useState, type FormEvent } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '../ui/toast';
import { Pencil, RefreshCw, Trash } from 'lucide-react';
import type { CreateUserPayload, UpdateUserPayload, UserRow } from '../../hooks/useUsers';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../ui/alert-dialog';

type FormState = {
    email: string;
    name: string;
    password: string;
    confirm: string;
};

const initialFormState: FormState = {
    email: '',
    name: '',
    password: '',
    confirm: ''
};

type UserManagementProps = {
    users: UserRow[];
    fetching: boolean;
    busy: boolean;
    error: string;
    fetchUsers: () => Promise<void>;
    createUser: (payload: CreateUserPayload) => Promise<void>;
    updateUser: (id: string, payload: UpdateUserPayload) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
};

export function UserManagement({
    users,
    fetching,
    busy,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
}: UserManagementProps) {
    const { notify } = useToast();
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);

    const resetForm = () => {
        setFormState(initialFormState);
        setSelectedUser(null);
        setDialogMode('create');
    };

    const openCreateDialog = () => {
        resetForm();
        setDialogMode('create');
        setDialogOpen(true);
    };

    const openEditDialog = (user: UserRow) => {
        setDialogMode('edit');
        setSelectedUser(user);
        setFormState({
            email: user.email,
            name: user.name,
            password: '',
            confirm: ''
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const email = formState.email.trim();
        const name = formState.name.trim();
        const password = formState.password;
        const confirm = formState.confirm;

        if (!email || !name) {
            notify('Email e nome são obrigatórios', 'error');
            return;
        }

        if (password && password.length < 6) {
            notify('Senha precisa ter pelo menos 6 caracteres', 'error');
            return;
        }
        if (password && password !== confirm) {
            notify('As senhas precisam ser iguais', 'error');
            return;
        }

        const payload: UpdateUserPayload = { email, name };
        if (password) {
            payload.password = password;
        }

        try {
            if (dialogMode === 'create') {
                if (!password) {
                    notify('Informe uma senha para criar o usuário', 'error');
                    return;
                }
                await createUser({ email, name, password });
                notify('Usuário criado com sucesso', 'success');
            } else {
                if (!selectedUser?._id) {
                    notify('Selecione um usuário', 'error');
                    return;
                }
                await updateUser(selectedUser._id, payload);
                notify('Usuário atualizado', 'success');
            }
            resetForm();
            setDialogOpen(false);
        } catch {
            notify('Erro ao salvar o usuário', 'error');
        }
    };

    const handleDelete = (user: UserRow) => {
        if (!user._id) {
            notify('Usuário inválido', 'error');
            return;
        }
        setPendingDelete(user);
        setAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete?._id) {
            setAlertOpen(false);
            return;
        }
        try {
            await deleteUser(pendingDelete._id);
            notify('Usuário removido', 'success');
            if (selectedUser?._id === pendingDelete._id) {
                resetForm();
            }
        } catch {
            notify('Erro ao remover o usuário', 'error');
        } finally {
            setAlertOpen(false);
            setPendingDelete(null);
        }
    };

    const formatDate = (value?: string) => {
        if (!value) return '--';
        return new Date(value).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            <Card className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-lg font-semibold text-[var(--text)]">Usuários</p>
                        <p className="text-sm text-[var(--muted)]">
                            {dialogMode === 'create'
                                ? 'Crie novos acessos para a equipe.'
                                : `Editando ${selectedUser?.email ?? 'usuário'}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" onClick={openCreateDialog} disabled={busy} type="button">
                            Novo usuário
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void fetchUsers()}
                            disabled={fetching || busy}
                            type="button"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </Button>
                    </div>
                </div>

                {fetching && <p className="text-sm text-[var(--muted)]">Atualizando lista...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                        <div className="overflow-hidden rounded-[12px] border border-[var(--table-border)] bg-[var(--table-bg)]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[var(--table-header)]">
                                        <TableHead>Email</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Papel</TableHead>
                                        <TableHead>Criado em</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length ? (
                                        users.map((user) => (
                                            <TableRow key={user._id ?? user.email}>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell className="capitalize">{user.role ?? 'usuário'}</TableCell>
                                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                                <TableCell className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(user)}
                                                        disabled={busy}
                                                        type="button"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={busy}
                                                        type="button"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                        Remover
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-[var(--muted)]"
                                            >
                                                {fetching ? 'Carregando usuários...' : 'Nenhum usuário cadastrado.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'create' ? 'Criar usuário' : 'Editar usuário'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="dialog-email">Email</Label>
                                <Input
                                    id="dialog-email"
                                    type="email"
                                    value={formState.email}
                                    onChange={(event) =>
                                        setFormState((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dialog-name">Nome</Label>
                                <Input
                                    id="dialog-name"
                                    value={formState.name}
                                    onChange={(event) =>
                                        setFormState((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dialog-password">
                                    {dialogMode === 'create' ? 'Senha' : 'Nova senha (opcional)'}
                                </Label>
                                <Input
                                    id="dialog-password"
                                    type="password"
                                    value={formState.password}
                                    onChange={(event) =>
                                        setFormState((prev) => ({ ...prev, password: event.target.value }))
                                    }
                                    placeholder={dialogMode === 'edit' ? 'Deixe em branco para manter' : ''}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dialog-confirm">Confirmar senha</Label>
                                <Input
                                    id="dialog-confirm"
                                    type="password"
                                    value={formState.confirm}
                                    onChange={(event) =>
                                        setFormState((prev) => ({ ...prev, confirm: event.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" type="button" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {dialogMode === 'create' ? 'Criar usuário' : 'Salvar alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação removerá o usuário {pendingDelete?.email ?? ''}. Deseja continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
