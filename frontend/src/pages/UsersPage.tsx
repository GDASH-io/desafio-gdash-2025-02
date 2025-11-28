import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@/core/api'

export const UsersPage = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [formData, setFormData] = useState({ nome: '', email: '', funcao: '' })

    const { data: users, isLoading } = useUsers()
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()
    const { toast } = useToast()

    const handleCreate = async () => {
        try {
            await createUser.mutateAsync(formData)
            toast({
                variant: 'success',
                title: 'Sucesso!',
                description: 'Usuário criado com sucesso',
            })
            setIsCreateOpen(false)
            setFormData({ nome: '', email: '', funcao: '' })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao criar usuário',
            })
        }
    }

    const handleEdit = async () => {
        if (!selectedUser || !selectedUser.id) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'ID do usuário não encontrado para edição',
            })
            return;
        }
        try {
            await updateUser.mutateAsync({ id: selectedUser.id, user: formData })
            toast({
                variant: 'success',
                title: 'Sucesso!',
                description: 'Usuário atualizado com sucesso',
            })
            setIsEditOpen(false)
            setSelectedUser(null)
            setFormData({ nome: '', email: '', funcao: '' })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao atualizar usuário',
            })
        }
    }

    const handleDelete = async () => {
        if (!selectedUser) return

        try {
            await deleteUser.mutateAsync(selectedUser.id)
            toast({
                variant: 'success',
                title: 'Sucesso!',
                description: 'Usuário excluído com sucesso',
            })
            setIsDeleteOpen(false)
            setSelectedUser(null)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao excluir usuário',
            })
        }
    }

    const openEditDialog = (user: User) => {
        setSelectedUser(user)
        setFormData({ nome: user.nome, email: user.email, funcao: user.funcao || '' })
        setIsEditOpen(true)
    }

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user)
        setIsDeleteOpen(true)
    }

    if (isLoading) {
        return <LoadingSpinner size="lg" />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-hand text-primary">Gerenciamento de Usuários</h1>
                    <p className="text-muted-foreground mt-1">Gerencie os usuários da aplicação</p>
                </div>
                <Button variant="spotify" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                </Button>
            </div>

            <Card className="sketch-card">
                <CardHeader>
                    <CardTitle className="font-hand">Todos os Usuários</CardTitle>
                    <CardDescription>Lista de todos os usuários do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.nome}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.funcao || 'User'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => openDeleteDialog(user)}
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-hand">Criar Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Adicione um novo usuário ao sistema. Preencha todos os detalhes abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="João Silva"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="joao@exemplo.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Função</Label>
                            <Input
                                id="funcao"
                                value={formData.funcao}
                                onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                                placeholder="Admin, Usuário, etc."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="spotify" onClick={handleCreate} disabled={createUser.isPending}>
                            Criar Usuário
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-hand">Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Atualize as informações do usuário. Faça as alterações e salve.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input
                                id="edit-nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Input
                                id="edit-funcao"
                                value={formData.funcao}
                                onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="spotify" onClick={handleEdit} disabled={updateUser.isPending}>
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-hand">Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
                            <strong> {selectedUser?.nome}</strong> do sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleteUser.isPending}>
                            Excluir Usuário
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
