import { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast'; 
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserForm } from './componentes/UserForm';

type User = { _id: string; name: string; email: string; typer_usuario: 'A' | 'U'; };
const formSchema = z.object({ name: z.string().min(3), email: z.string().email(), typer_usuario: z.enum(['A', 'U']), password: z.string().optional().or(z.literal('')), });
type UserFormData = z.infer<typeof formSchema>;

export function Users() {

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error("Erro ao buscar usuários. Tente novamente."); 
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

 
  async function handleSaveUser(data: UserFormData) {
    setIsSaving(true);
    const payload = { ...data };
    if (selectedUser && !payload.password) {
      delete payload.password;
    }

    const savePromise = selectedUser
      ? api.patch(`/users/${selectedUser._id}`, payload) 
      : api.post('/users', payload);                  

    toast.promise(savePromise, {
      loading: 'Salvando usuário...',
      success: () => {
        setIsDialogOpen(false);
        setSelectedUser(null);
        fetchUsers(); 
        return selectedUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!';
      },
      error: (err) => err.response?.data?.message || 'Ocorreu um erro ao salvar.',
    }).finally(() => {
      setIsSaving(false);
    });
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;

    const deletePromise = api.delete(`/users/${userToDelete._id}`);

    toast.promise(deletePromise, {
      loading: 'Excluindo usuário...',
      success: () => {
        setIsAlertOpen(false);
        setUserToDelete(null);
        fetchUsers(); 
        return 'Usuário excluído com sucesso!';
      },
      error: 'Ocorreu um erro ao excluir.',
    });
  }

  function openNewUserDialog() { setSelectedUser(null); setIsDialogOpen(true); }
  function openEditDialog(user: User) { setSelectedUser(user); setIsDialogOpen(true); }
  function openDeleteAlert(user: User) { setUserToDelete(user); setIsAlertOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !isSaving && setIsDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button onClick={openNewUserDialog}>Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <UserForm user={selectedUser} onSave={handleSaveUser} isSaving={isSaving} />
          </DialogContent>
        </Dialog>
      </div>

      {/**TABELA */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">Carregando...</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.typer_usuario === 'A' ? 'Admin' : 'Usuário'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteAlert(user)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. Isso irá excluir permanentemente o usuário "{userToDelete?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}