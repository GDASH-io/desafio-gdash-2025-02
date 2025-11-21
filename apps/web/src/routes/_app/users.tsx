import { UserType } from '@repo/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DeleteUserDialog, UserForm, UsersTable } from '@/components/users'
import { useAuth } from '@/contexts/auth-context'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/services/users'

export const Route = createFileRoute('/_app/users')({
  component: UsersPage,
})

function UsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => fetchUsers(page, limit),
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário criado com sucesso!')
      resetForm()
    },
    onError: () => toast.error('Erro ao criar usuário'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário atualizado!')
      resetForm()
    },
    onError: () => toast.error('Erro ao atualizar usuário'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário excluído!')
    },
    onError: () => toast.error('Erro ao excluir usuário'),
  })

  const resetForm = () => {
    setIsCreating(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'USER' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      const updateData: any = { name: formData.name, email: formData.email, role: formData.role }
      if (formData.password) updateData.password = formData.password
      updateMutation.mutate({ id: editingUser.id, data: updateData })
    } else {
      createMutation.mutate(formData as any)
    }
  }

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, password: '', role: user.role })
    setIsCreating(true)
  }

  const handleDeleteClick = (user: UserType) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode excluir a si mesmo')
      return
    }
    setUserToDelete(user)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
      setUserToDelete(null)
    }
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Acesso restrito a administradores</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Usuários</h1>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      {isCreating && (
        <UserForm
          formData={formData}
          editingUser={editingUser}
          isPending={createMutation.isPending || updateMutation.isPending}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <UsersTable
        users={data?.items || []}
        currentUserId={currentUser?.id}
        page={page}
        totalPages={data?.meta.totalPages || 1}
        limit={limit}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <DeleteUserDialog
        user={userToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  )
}
