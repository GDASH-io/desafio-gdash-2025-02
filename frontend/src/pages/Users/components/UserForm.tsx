import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Shield, Lock } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog"; // Usado aqui para manter o estilo dos botões no rodapé

import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/userType";

// Schema de validação isolado
const formSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().optional(),
  role: z.enum(["admin", "user"], {
    message: "Selecione uma permissão",
  }),
});

interface UserFormProps {
  userToEdit: User | null;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ userToEdit, onSubmit, onCancel }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "user",
    },
  });

  // Atualiza o formulário quando o usuário alvo muda
  useEffect(() => {
    if (userToEdit) {
      form.reset({
        email: userToEdit.email,
        password: "",
        role: userToEdit.role,
      });
    } else {
      form.reset({
        email: "",
        password: "",
        role: "user",
      });
    }
  }, [userToEdit, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Lógica de negócio: Validação de senha na criação
    if (!userToEdit && (!values.password || values.password.length < 6)) {
      form.setError("password", {
        message: "Senha obrigatória (mín. 6 caracteres)",
      });
      return;
    }

    if (userToEdit && values.password && values.password.length < 6) {
      form.setError("password", {
        message: "A nova senha deve ter no mínimo 6 caracteres",
      });
      return;
    }

    const payload = { ...values };
    if (userToEdit && !payload.password) {
      delete payload.password;
    }

    await onSubmit(payload as CreateUserPayload | UpdateUserPayload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 py-2"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="usuario@exemplo.com"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Senha{" "}
                {userToEdit && (
                  <span className="text-zinc-400 font-normal">(Opcional)</span>
                )}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder={
                      userToEdit ? "••••••••" : "Mínimo 6 caracteres"
                    }
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              {userToEdit && (
                <FormDescription className="text-xs">
                  Preencha apenas se desejar alterar a senha atual.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Acesso</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-zinc-400 z-10" />
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </div>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário Padrão</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões de Ação */}
        <DialogFooter className="pt-4 gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {userToEdit ? "Salvar Alterações" : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
