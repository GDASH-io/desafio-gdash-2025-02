import { useEffect, useState } from "react";
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
import type { ListUsers, UpdateUser } from "@/services/usersService";

interface EditUserDialogProps {
  open: boolean;
  user?: ListUsers;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => Promise<void> | void;
}

export function EditUserDialog({ open, user, onOpenChange, onUpdated }: EditUserDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open && user) {
      setEmail(user.email);
      setRole(user.role as 'admin' | 'user');
      setPassword("");
      setError(undefined);
    } else if (!open) {
      setEmail("");
      setPassword("");
      setRole('user');
      setError(undefined);
    }
  }, [open, user]);

  const validate = () => {
    if (!email.trim()) return "E-mail obrigatório";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Formato de e-mail inválido";
    if (password && password.length < 6) return "Senha deve ter ao menos 6 caracteres";
    return undefined;
  };

  const handleSave = async () => {
    if (!user) return;
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    setError(undefined);
    try {
      const payload: UpdateUser = { email, role };
      if (password.trim()) payload.password = password.trim();
      await usersService.update(user.id, payload);
      if (onUpdated) await onUpdated();
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>Atualize os dados necessários. Senha é opcional.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email-edit">E-mail</Label>
            <Input id="email-edit" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-edit">Senha (opcional)</Label>
            <Input id="password-edit" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-edit">Tipo</Label>
            <select
              id="role-edit"
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !user}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;
