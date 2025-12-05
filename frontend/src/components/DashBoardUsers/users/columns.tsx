import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDeleteUser } from "@/hooks/useDeleteUser"
import { useUpdateUser } from "@/hooks/useUpdateUser"
import { zodResolver } from "@hookform/resolvers/zod"
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

export type User = {
  name: string,
  email: string,
  joinedAt: string
}

const updateSchema = z.object({
  username: z.string()
    .min(3, "Minímo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Nome pode conter apenas letras, números e . _ -"),
  email: z.email("Email inválido"),
})

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome"
  },
  {
    accessorKey: "email",
    header: "Eamil"
  },
  {
    accessorKey: "joinedAt",
    header: "Entrou em",
    cell: ({ row }) => {
      const jointedAt = new Date(row.getValue("joinedAt"))
      const hoje = jointedAt.toLocaleDateString("pt-br") === new Date().toLocaleDateString("pt-br")
      return <div>{hoje ? "hoje" : jointedAt.toLocaleDateString("pt-br")}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const original = row.original
      const { deleteUser } = useDeleteUser(original.email)
      const { updateUser } = useUpdateUser(original.email)
      const [isOpen, setIsOpen] = useState(false);
      const form = useForm<z.infer<typeof updateSchema>>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
          username: original.name,
          email: original.email
        }
      })

      const handleUpdateUser = async (data: z.infer<typeof updateSchema>) => {
        await updateUser({name: data.username, email: data.email})
        setIsOpen(false)
      }

      return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-8 w-8 p-0">
              <span className="sr-only">Opções</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              variant="destructive"
              onSelect={e => { e.preventDefault() }}

            >
              <AlertDialog>
                <AlertDialogTrigger>
                  Deletar
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja apagar a conta {original.email}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Após a deleção da conta (email: {original.email}; nome: {original.name}), a ação não poderá ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      deleteUser();
                      setIsOpen(false)
                    }}>Continuar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              <Dialog>
                <DialogTrigger>
                  Alterar
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={form.handleSubmit(handleUpdateUser)}>
                    <DialogHeader>
                      <DialogTitle>Alterar dados de {original.email}</DialogTitle>
                      <DialogDescription>Digite os novos dados nos campos abaixo para alterar</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Controller
                        name="username"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Nome</FieldLabel>
                            <Input
                              {...field}
                              id="username"
                              aria-invalid={fieldState.invalid}
                              required
                            />
                            {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                          </Field>
                        )}
                      />
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Email</FieldLabel>
                            <Input
                              {...field}
                              id="email"
                              aria-invalid={fieldState.invalid}
                              required
                            />
                            {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                          </Field>
                        )}
                      />
                      <Field className="md:flex md:flex-row md:w-1/2">
                        <Button variant={"outline"} type="submit">Salvar alterações</Button>
                        <Button type="button" onClick={() => setIsOpen(false)}>Cancelar</Button>
                      </Field>
                    </FieldGroup>
                  </form>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]