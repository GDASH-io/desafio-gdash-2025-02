import React from "react";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import type { IUser } from "../interfaces/user.interface";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

interface UserFormDialogProps {
  user?: IUser;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!user;
  const [email, setEmail] = React.useState(user?.email || "");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "user">(
    user?.role || "user"
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEmail(user?.email || "");
    setPassword("");
    setRole(user?.role || "user");
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const data: CreateUserDto | UpdateUserDto = { email, role };
    if (password) {
      data.password = password;
    }

    try {
      if (!isEditing && !password) {
        setError("A senha é obrigatória para novos usuários.");
        return;
      }

      await onSubmit(data);

      onClose();
    } catch (submitError) {
      const message =
        (submitError as any).response?.data?.message ||
        "Ocorreu um erro ao salvar o usuário.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Editar Usuário: ${user?.email}`
              : "Criar Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Senha {isEditing ? "(deixe em branco para não alterar)" : ""}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função (Role)</Label>
              <Select
                value={role}
                onValueChange={(value: "admin" | "user") => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" variant="gdash" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                ? "Salvar Alterações"
                : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
