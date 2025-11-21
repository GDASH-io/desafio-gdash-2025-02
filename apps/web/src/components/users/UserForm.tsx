import { UserType } from '@repo/shared'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
}

interface UserFormProps {
  formData: UserFormData
  editingUser: UserType | null
  isPending: boolean
  onFormDataChange: (data: UserFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function UserForm({
  formData,
  editingUser,
  isPending,
  onFormDataChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Senha {editingUser && '(deixe vazio para manter)'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.role}
                onChange={(e) => onFormDataChange({ ...formData, role: e.target.value })}
              >
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {editingUser ? 'Atualizar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
