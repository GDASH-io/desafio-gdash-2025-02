import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { EyeOffIcon, EyeIcon } from 'lucide-react'
import { api } from "@/api/api";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";
import { userAtom } from "@/atom/store";
import { TypographyMuted } from "../ui/tipography";
import { RouterLink } from "../RouterLink";
import { verifyLogin } from "@/utils/verifyLogin";

const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Campo não pode ficar vazio!")
})

export function LoginForm() {

  const navigate = useNavigate();
  const [, setLogged] = useAtom(userAtom)

  const login = useMutation({
    mutationFn: async (userData: { email: string, password: string }) => {
      return await api.post("/user/login", userData, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      })
    },
    onSuccess: (res: AxiosResponse<{ success: boolean, message: string, email: string, name: string, isAdmin: boolean }>) => {
      const {name, email, message, isAdmin} = res.data;
      toast.success(message)
      localStorage.setItem("user", JSON.stringify({name, email, isAdmin}));
      setLogged({name, email, isAdmin})
      navigate("/dashboard")
    },
    onError: (error: AxiosError<{ status: boolean, message: string }>) => {
      if (error.response?.data.message.includes("Senha incorreta")) {
        form.setError("password", {
          type: "server",
          message: error.response?.data.message
        });
      } else if (error.response?.data.message.includes("Usuário não encontrado")) {
        form.setError("email", {
          type: "server",
          message: error.response?.data.message
        });
      } else {
        console.error(error)
      }
    }
  })

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(prev => !prev)

  const handleLogin = (userData: z.infer<typeof loginSchema>) => {
    login.mutate(userData)
  }

  useEffect(() => {
    verifyLogin().then(res => {
      if (res) {
        toast.warning("Usuário já logado")
        navigate("/dashboard")
      }
    })
  }, []);

  return (
    <>
      <Card className={cn("max-w-1/4 min-w-80")}>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Faça login para começar a ver o clima!
          </CardDescription>
        </CardHeader>
        <CardContent className="pr-6 pl-6">
          <form id="loginForm" onSubmit={form.handleSubmit(handleLogin)}>
            <FieldGroup>
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
                      placeholder="nome@email.com"
                      aria-invalid={fieldState.invalid}
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
              <Field className="pt-6">
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <TypographyMuted><RouterLink url="/signup">Criar conta</RouterLink></TypographyMuted>
    </>
  )
}