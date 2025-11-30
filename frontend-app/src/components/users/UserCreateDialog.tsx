import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface UserCreateDialogProps {
  onCreate: (data: { name: string; email: string; password: string }) => Promise<void>
  loading: boolean
}

export function UserCreateDialog({ onCreate, loading }: UserCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreate({ name, email, password })
    setIsOpen(false)
    setName(""); setEmail(""); setPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Usuário</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione um novo administrador ao sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border-slate-800" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-950 border-slate-800" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border-slate-800" required minLength={6} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 w-full">
              {loading ? "Salvando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
