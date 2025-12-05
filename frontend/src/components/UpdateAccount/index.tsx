import { UserPenIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAccountSchema } from "../AccountMenagement";
import { userAtom } from "@/atom/store";
import { useAtomValue } from "jotai";
import * as z from "zod";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useState } from "react";

export function UpdateAccount() {
  const user = useAtomValue(userAtom);
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      username: user?.name,
      email: user?.email,
    }
  });
  const handleUpdateUser = async (data: z.infer<typeof updateAccountSchema>) => {
    if (data.password && data.password.length === 0) {
      data = { username: data.username, email: data.email }
    }
    await updateUser({ name: data.username, email: data.email, password: data.password });
  }
  const { updateUser } = useUpdateUser(user!.email);

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <section className="max-w-124">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <UserPenIcon />
            <span>Alterar informações</span>
          </CardTitle>
          <CardDescription>Altere suas informações abaixo e faça login novamente</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleUpdateUser)}
          >
            <FieldGroup className="">
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Nome</FieldLabel>
                    <Input
                      {...field}
                      id="username"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: joao_vitor"
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
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="email@email.com"
                      required
                    />
                    {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
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
              <Field>
                <Button type="submit">Salvar alterações</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}