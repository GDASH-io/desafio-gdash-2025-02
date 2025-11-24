import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Schema de validação
const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Dados mockados
const initialUsers: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@example.com', createdAt: '2025-01-15' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com', createdAt: '2025-01-20' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', createdAt: '2025-02-01' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@example.com', createdAt: '2025-02-10' },
];

export function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const handleCreate = (data: UserFormData) => {
    const newUser: User = {
      id: String(users.length + 1),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setIsCreateOpen(false);
    reset();
    toast({
      variant: 'success',
      title: 'Usuário criado',
      description: `${data.name} foi adicionado com sucesso.`,
    });
  };

  const handleEdit = (data: UserFormData) => {
    if (!selectedUser) return;
    
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, name: data.name, email: data.email }
        : user
    ));
    setIsEditOpen(false);
    setSelectedUser(null);
    reset();
    toast({
      variant: 'success',
      title: 'Usuário atualizado',
      description: `${data.name} foi editado com sucesso.`,
    });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    
    const userName = selectedUser.name;
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setIsDeleteOpen(false);
    setSelectedUser(null);
    toast({
      variant: 'destructive',
      title: 'Usuário removido',
      description: `${userName} foi excluído do sistema.`,
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    reset({ name: user.name, email: user.email, password: '' });
    setIsEditOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8" style={{ background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))' }}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Criar Usuário */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo usuário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreate)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nome</Label>
                  <Input
                    id="create-name"
                    {...register('name')}
                    placeholder="Digite o nome"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    {...register('email')}
                    placeholder="Digite o email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Senha</Label>
                  <Input
                    id="create-password"
                    type="password"
                    {...register('password')}
                    placeholder="Digite a senha"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Editar Usuário */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize os dados do usuário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleEdit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    {...register('name')}
                    placeholder="Digite o nome"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...register('email')}
                    placeholder="Digite o email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    {...register('password')}
                    placeholder="Deixe em branco para manter a atual"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmar Exclusão */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o usuário <strong>{selectedUser?.name}</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Deletar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
