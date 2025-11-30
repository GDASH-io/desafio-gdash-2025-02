import { UserService } from "@/app/service/users";
import { SelectOptions } from "@/components/SelectOptions";
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

const createUserSchema = z.object({
  name: z
    .string("Nome é obrigatório")
    .min(4, "O nome deve ter no mínimo 4 caracteres"),
  email: z.email("Email inválido"),
  password: z
    .string("A senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(UserService.Role),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await UserService.createUser(data);
      onClose();
      form.reset();
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message || "Não foi possível criar o usuário"
        );
      } else {
        toast.error("Não foi possível criar o usuário");
      }
    }
  });

  const roleOptions = [{label: 'Admin', value: UserService.Role.ADMIN}, {label: 'User', value: UserService.Role.USER}]

  return (
    <Modal
      isDialogOpen={isOpen}
      onClose={onClose}
      title="Criar Usuário"
      description="Preencha as informações do novo usuário"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="*****"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selecione o nível de acesso</FormLabel>
                <FormControl>
                 <SelectOptions 
                    className="w-full max-w-full"
                    disabled={field.disabled}
                    options={roleOptions}
                    setOptions={field.onChange}
                 />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                !form.formState.isValid
              }
              className="w-full"
            >
              {form.formState.isSubmitting ? <Spinner /> : "Criar usuário"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
