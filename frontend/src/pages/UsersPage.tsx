import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, Loader2, X, Check, User as UserIcon } from 'lucide-react';
import { 
  Card, CardContent, CardTitle 
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { toast } from 'sonner';


interface UserData {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

const API_URL = 'http://localhost:3000/users';

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<UserData> | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [fetchError, setFetchError] = useState('');
    const toastSuccess = "bg-emerald-600 text-white border border-emerald-700"
    const toastError = "bg-red-600 text-white border border-red-700"
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

    // isUpdating é um booleano derivado do estado para o JSX
    const isUpdating = !!currentUser?._id;

    const token = localStorage.getItem('access_token');
    
    // O token já é verificado no DashboardLayout, aqui apenas garantimos o fetch
    
    // --- FETCH (LISTAR) ---
    const fetchUsers = async () => {
        if (!token) return;
        setLoading(true);
        setFetchError('');
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                // Se desautorizado, desloga via layout (fallback de segurança)
                localStorage.removeItem('access_token');
                navigate('/login'); 
                return;
            }
            if (!response.ok) throw new Error(`Erro ao buscar: ${response.statusText}`);

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            setFetchError("Falha ao carregar usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, navigate]);

    // --- CUIDADOS COM O FORMULÁRIO ---
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ name: '', email: '', password: '' });
        setCurrentUser(null);
        setIsDialogOpen(false);
    };

    // --- ABRIR MODAL (CREATE/UPDATE) ---
    const openModal = (user?: UserData) => {
        if (user) {
            setCurrentUser(user);
            setForm({ name: user.name, email: user.email, password: '' });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    // --- SUBMIT (CREATE/UPDATE) ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        let url = API_URL;
        let method = 'POST';
        let body: any = { name: form.name, email: form.email };

        if (form.password) {
            body.password = form.password;
        }

        if (isUpdating) {
            url = `${API_URL}/${currentUser?._id}`;
            method = 'PUT';
            // Para atualização, não precisamos enviar a senha se ela estiver vazia
            if (!form.password) delete body.password;
        } else {
            // Senha é obrigatória na criação
            if (!form.password) {
                setFetchError("Senha é obrigatória para novos usuários.");
                return;
            }
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (response.status === 401 || response.status === 403) {
                 localStorage.removeItem('access_token');
                 navigate('/login'); 
                 return;
            }
            
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                 throw new Error(errorData.message || `Falha na operação: ${response.status}`);
            }

            await fetchUsers(); // Atualiza a lista
            toast.success('Usuário adicionado com sucesso!', { className: toastSuccess })
            resetForm();
        } catch (error) {
            setFetchError(`Erro ao salvar usuário: ${error instanceof Error ? error.message : ''}`);
            console.error(error);
        }
    };

    // --- DELETE ---
    const handleDelete = async (userId: string) => {
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
        toast.error("Falha ao deletar usuário.");
        throw new Error("Erro ao deletar");
        }

        // Atualiza lista
        await fetchUsers();

        toast.success("Usuário deletado com sucesso!");

    } catch (error) {
        console.error(error);
    }
    };


    return (
        <div className="space-y-6">
            
            {/* --- HEADER (Título da Página) --- */}
            <Card className="flex justify-between flex-col md:flex-row items-center p-4 rounded-xl shadow-sm gap-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <UserIcon className="h-6 w-6 text-teal-600" />
                    Gerenciamento de Usuários
                </CardTitle>
                <Button 
                    onClick={() => openModal()} 
                    className="w-full sm:max-w-xs bg-teal-600 rounded-lg hover:bg-teal-700 text-white shadow-sm transition-all"
                    size='lg'
                >
                    <Plus/>
                    Novo Usuario
                </Button>
            </Card>

            <Separator />

            {/* --- MENSAGENS DE STATUS --- */}
            {fetchError && (
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Erro na API</AlertTitle>
                    <AlertDescription>{fetchError}</AlertDescription>
                </Alert>
            )}

            {/* --- TABELA DE USUÁRIOS --- */}
            <Card className="shadow-lg border-slate-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Carregando...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                                        Nenhum usuário cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="icon" variant="outline" onClick={() => openModal(user)} title="Editar" className="hover:bg-teal-50 hover:text-teal-600 border-teal-200">
                                                <Edit3/>
                                            </Button>
                                            <Button size="icon" variant="destructive" title="Deletar" onClick={() => {
                                                setUserToDelete(user)
                                                setIsDeleteDialogOpen(true)
                                            }} >
                                                <Trash2/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* --- MODAL DE CRIAÇÃO/EDIÇÃO --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isUpdating ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                        <DialogDescription>
                            Preencha os detalhes para {isUpdating ? 'atualizar' : 'criar'} a conta.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input 
                                    id="name" 
                                    name="name"
                                    value={form.name} 
                                    onChange={handleFormChange} 
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    name="email"
                                    type="email"
                                    value={form.email} 
                                    onChange={handleFormChange} 
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha {isUpdating && <span className="text-xs text-muted-foreground">(Deixe vazio para manter a atual)</span>}</Label>
                                <Input 
                                    id="password" 
                                    name="password"
                                    type="password"
                                    value={form.password} 
                                    onChange={handleFormChange} 
                                    placeholder={isUpdating ? 'Nova Senha' : 'Senha'}
                                    required={!isUpdating} // Senha é obrigatória apenas na criação
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    <X className="h-4 w-4 mr-2" /> Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                                <Check className="h-4 w-4 mr-2" /> {isUpdating ? 'Salvar Alterações' : 'Criar Usuário'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogDescription>
                    Tem certeza que deseja deletar o usuário <strong>{userToDelete?.name}</strong>?
                </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2 mt-4">
                <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                >
                    Cancelar
                </Button>

                <Button
                    variant="destructive"
                    onClick={async () => {
                    if (!userToDelete) return;
                    await handleDelete(userToDelete._id);
                    setIsDeleteDialogOpen(false);
                    }}
                >
                    Deletar
                </Button>
                </div>
            </DialogContent>
            </Dialog>

        </div>
    );
}