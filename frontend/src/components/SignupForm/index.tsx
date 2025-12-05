import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { EyeOffIcon, EyeIcon } from 'lucide-react'
import * as z from 'zod'
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from "@/api/api";
import { toast } from "sonner";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { TypographyMuted } from "../ui/tipography";
import { RouterLink } from "../RouterLink";

const signupSchema = z.object({
  username: z.string()
    .min(3, "Minímo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Nome pode conter apenas letras, números e . _ -"),
  email: z.email("Email inválido"),
  password: z.string()
    .min(6, "Mínimo 6 carateres")
    .max(20, "Máximo 20 carateres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Senha precisa de maiúscula, minúscula, número e símbolo")
});

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(prev => !prev)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const createAccount = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (newUser: { name: string, email: string, password: string }) => {
      const res = await api.post("/user/signup", newUser)
      return res;
    },
    onSuccess: ({ data }: AxiosResponse<{ success: boolean, message: string }>) => {
      toast.success(data.message)
      setTimeout(() => navigate("/"), 500)

      queryClient.invalidateQueries({ queryKey: ["signup"] });
    },

    onError: (error: Error & AxiosError<{ success: boolean, message: string }>) => {
      toast.error(error.response!.data.message);
      console.log(error.response!.data)
    }
  })


  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  })

  const handleCreateAccount = async (data: z.infer<typeof signupSchema>) => {

    createAccount.mutate({ ...data, name: data.username })
  }


  return (
    <>
      <Card className={cn("max-w-1/4 min-w-80")}>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Crie uma conta para usar o painel!
          </CardDescription>
        </CardHeader>
        <CardContent className="pr-6 pl-6">
          <form id="signupForm" onSubmit={form.handleSubmit(handleCreateAccount)}>
            <FieldGroup>
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
              <Field>
                <Button type="submit">Criar conta</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
        </CardFooter>
      </Card >
      <TypographyMuted><RouterLink url="/">Entrar na conta</RouterLink></TypographyMuted>
    </>
  )
}