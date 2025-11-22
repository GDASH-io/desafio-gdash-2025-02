import { SideBar } from "@/components/SideBar"
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/useUsers"
import { UserCreateDialog, UsersTable } from "@/components/users"

export const Users = () => {
  const { users, loading: loadingList } = useUsers()
  const { createUser, loading: loadingCreate } = useCreateUser()
  const { deleteUser, loading: loadingDelete } = useDeleteUser()

  const handleCreate = async (data: { name: string; email: string; password: string }) => {
    try {
      await createUser(data)
    } catch {
      alert("Erro ao criar usuário")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await deleteUser(id)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <SideBar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
            <p className="text-slate-400 mt-1">Administre quem tem acesso ao sistema.</p>
          </div>
          <UserCreateDialog onCreate={handleCreate} loading={loadingCreate} />
        </div>
        <UsersTable users={users || []} loading={loadingList} onDelete={handleDelete} deleting={loadingDelete} />
      </main>
    </div>
  )
}
