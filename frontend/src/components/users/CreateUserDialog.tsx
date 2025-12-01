import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import usersService from "@/services/usersService";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => Promise<void> | void;
}

export function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRole('user');
    setError(undefined);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) resetForm();
  };

  const validate = () => {
    if (!email.trim()) return "E-mail obrigatório";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Formato de e-mail inválido";
    if (!password.trim()) return "Senha obrigatória";
    if (password.length < 6) return "Senha deve ter ao menos 6 caracteres";
    return undefined;
  };

  const handleCreate = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    setError(undefined);
    try {
      await usersService.create({ email, password, role });
      if (onCreated) await onCreated();
      handleOpenChange(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>Preencha os campos para criar um usuário.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
          </div>
            <div className="space-y-2">
              <Label htmlFor="role">Tipo</Label>
              <select
                id="role"
                className="w-full rounded border px-2 py-2 text-sm bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              >
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
