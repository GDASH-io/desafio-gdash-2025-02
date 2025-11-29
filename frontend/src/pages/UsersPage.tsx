import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCreateForm } from '@/components/custom/UserCreateForm';
import { UserEditForm } from '@/components/custom/UserEditForm';
import { Trash2, UserCog, Loader2, UserPlus, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; 

interface User {
    _id: string;
    email: string;
    createdAt: string;
}

const API_URL = "http://localhost:3000";
const PROTECTED_EMAILS = ['gdash@gdash.com', 'admin@example.com'];

export function UsersPage() {
    const { token, handleLogout } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null); 

    const fetchUsers = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                handleLogout();
                throw new Error("Sessão expirada.");
            }
            if (!response.ok) throw new Error("Falha ao buscar usuários.");

            const data = await response.json();
            setUsers(data); 
        } catch (error) {
            console.error("Erro na gestão de usuários:", error);
        } finally {
            setLoading(false);
        }
    }, [token, handleLogout]);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

        setDeletingId(id);
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.status === 403) {
                alert("Erro: Não é permitido deletar o usuário administrador padrão.");
            } else if (!response.ok) {
                throw new Error("Falha ao deletar.");
            }

            fetchUsers(); 
        } catch (error) {
            console.error("Erro ao deletar:", error);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const usersByEmail = new Map<string, User>();
    users.forEach(user => usersByEmail.set(user.email, user));
    const uniqueUsers = Array.from(usersByEmail.values());
    
    const adminUser = uniqueUsers.find(u => PROTECTED_EMAILS.includes(u.email));
    const normalUsersList = uniqueUsers.filter(u => u.email !== adminUser?.email); 

    if (loading) {
        return <div className="text-center p-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" /></div>;
    }

    return (
        <>
        <Card className="bg-slate-900/40 backdrop-blur border-slate-800 text-slate-100 mt-8 animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="flex flex-row justify-between items-center">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-indigo-400" />
                        Gestão de Usuários
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Total de Contas (Ativas): {normalUsersList.length + (adminUser ? 1 : 0)}
                    </CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 transition-colors">
                    <UserPlus className="h-4 w-4 mr-2" /> Adicionar Novo
                </Button> 
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-800/80">
                            <TableRow className="border-slate-700">
                                <TableHead className="text-slate-300">Email</TableHead>
                                <TableHead className="text-slate-300">Criado Em</TableHead>
                                <TableHead className="text-right text-slate-300">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {adminUser && (
                                <TableRow key={adminUser._id} className="bg-slate-700/50 hover:bg-slate-700/70 border-slate-700 font-bold">
                                    <TableCell className="font-semibold text-emerald-400">{adminUser.email} (Admin)</TableCell>
                                    <TableCell className="text-slate-300">{new Date(adminUser.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell className="text-right text-slate-500">
                                        <Button variant="outline" size="sm" disabled className="text-slate-500 border-slate-700 bg-slate-950/20 cursor-not-allowed">
                                            Protegido
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}

                            {normalUsersList.map((user) => (
                                <TableRow key={user._id} className="hover:bg-slate-800/30 border-slate-800 transition-colors">
                                    <TableCell className="font-medium text-slate-200">{user.email}</TableCell>
                                    <TableCell className="text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setEditingUser(user)} 
                                            className="border-indigo-700/50 bg-indigo-900/20 hover:bg-indigo-900/40 hover:text-white group">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => handleDelete(user._id)}
                                            disabled={deletingId === user._id}
                                            className="bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40"
                                        >
                                            {deletingId === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-slate-900/90 backdrop-blur-md border-slate-700 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-xl text-white flex items-center gap-2"><UserPlus className="h-5 w-5" /> Criar Novo Usuário</DialogTitle>
                    <DialogDescription className="text-slate-400">Insira as credenciais para uma nova conta.</DialogDescription>
                </DialogHeader>
                <UserCreateForm 
                    onSuccess={() => { fetchUsers(); setIsDialogOpen(false); }} 
                    onClose={() => setIsDialogOpen(false)} 
                />
            </DialogContent>
        </Dialog>
        
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="bg-slate-900/90 backdrop-blur-md border-slate-700 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-xl text-white flex items-center gap-2"><Pencil className="h-5 w-5" /> Editar Usuário: {editingUser?.email}</DialogTitle>
                    <DialogDescription className="text-slate-400">Altere o email ou a senha do usuário.</DialogDescription>
                </DialogHeader>
                {editingUser && (
                    <UserEditForm 
                        user={editingUser}
                        onSuccess={() => { fetchUsers(); setEditingUser(null); }} 
                        onCancel={() => setEditingUser(null)} 
                    />
                )}
            </DialogContent>
        </Dialog>
        </>
    );
}