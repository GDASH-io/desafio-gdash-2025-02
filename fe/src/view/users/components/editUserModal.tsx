import { useAuth } from "@/app/hooks/useAuth";
import { UserService } from "@/app/service/users";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Modal from "../../../components/modal";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";

const editUserSchema = z.object({
  name: z.string().min(4, "O nome deve ter no mínimo 4 caracteres"),
  email: z.email("Email inválido"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface User {
  id: string;
  name: string;
  email: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { isMe } = useAuth();
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (!user) return;
    try {
      if(!isMe(user.id)) {
        await UserService.updateUser({ id: user.id, ...data });
      } else {
        await UserService.updateMe({ id: user.id, ...data });
      }
      
      onClose();
      form.reset();
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message || "Não foi possível atualizar o usuário"
        );
      } else {
        toast.error("Não foi possível atualizar o usuário");
      }
    }
  });

  return (
    <Modal
      isDialogOpen={isOpen}
      onClose={onClose}
      title="Editar Usuário"
      description="Atualize as informações do usuário"
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Nome do usuário" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@exemplo.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant={"outline"}
              onClick={onClose}
              disabled={form.formState.isSubmitting}
              className="bg-transparent text-white hover:text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                !form.formState.isDirty ||
                !form.formState.isValid
              }
            >
              {form.formState.isSubmitting ? <Spinner /> : "Atualizar usuário"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
