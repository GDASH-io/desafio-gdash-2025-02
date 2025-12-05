import { Trash2Icon, EyeOffIcon, EyeIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAccountSchema } from "../AccountMenagement";
import * as z from "zod";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useState } from "react";

export function DeleteAccount() {
  const [showPassword, setShowPassword] = useState(false)
  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const { deleteAccount } = useDeleteAccount();
  const form2 = useForm({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      password: ""
    }
  })

  const handleDeleteAccount = async (data: z.infer<typeof updateAccountSchema>) => {
    await deleteAccount(data.password as string);
  }

  return (
    <section className="xl:max-w-138">
      <Card className="bg-destructive">
        <CardHeader>
          <div className="flex gap-2 items-center">
            <Trash2Icon className="text-black" />
            <CardTitle className="text-black">Deletar conta</CardTitle>
          </div>
          <CardDescription className="text-black">Ao clicar em <b>"deletar"</b> você está ciente de que esta ação <b>não pode ser desfeita</b>.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"secondary"}>Deletar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <b>Confirme sua senha</b>
                </DialogTitle>
                <DialogDescription>
                  Digite sua senha uma ultima vez para confirmar a deleção da sua conta
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form2.handleSubmit(handleDeleteAccount)}>
                <Controller
                  name="password"
                  control={form2.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Senha</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                          value={(field.value as string)}
                          required
                        />
                        <Button
                          type="button"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                        </Button>
                      </div>
                      {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                    </Field>
                  )}
                />
                <Field className="mt-3 sm:mt-6 sm:flex-row sm:w-1/2">
                  <DialogClose asChild>
                    <Button type="button">Cancelar</Button>
                  </DialogClose>
                  <Button className="bg-destructive text-black" type="submit">Apagar conta</Button>
                </Field>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </section>
  )
}