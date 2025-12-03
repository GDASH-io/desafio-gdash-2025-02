import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useState } from "react";
import { ArrowArcLeftIcon, SealCheckIcon } from "@phosphor-icons/react";
import { Axios } from "../lib/axios";

const bodyValidationSchema = z.object({
  name: z.string().optional(),
  userName: z.string().optional(),
  email: z.email("Por favor, insira Um Email válido."),
  password: z.string().min(8, "A senha deve conter o mínimo de 8 caracteres"),
});

type BodyValidationSchema = z.infer<typeof bodyValidationSchema>;

export function CardLogin() {
  const [messageState, SetMessageState] = useState<string | null>(null);

  const [stateRegister, SetStateRegister] = useState<boolean>(false);

  const [errorState, SetErrorState] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BodyValidationSchema>({
    resolver: zodResolver(bodyValidationSchema),
  });

  async function handleStateRegister() {
    SetStateRegister(!stateRegister);
  }

  async function handleLogin({ email, password }: BodyValidationSchema) {
    console.log(email, password);
    await Axios
      .post("/authenticate", {
        email,
        password,
      })
      .then((response) => {
        const tokenId = response.data.access_token;
        const cookie = Cookies.set("token", tokenId, { expires: 1 });
        window.location.reload();
        return cookie;
      })
      .catch((error) => {
        const { message } = error.response.data;
        SetErrorState(message);
      });
  }

  async function handleRegister({
    name,
    userName,
    email,
    password,
  }: BodyValidationSchema) {
    await Axios
      .post("/account", {
        name,
        userName,
        email,
        password,
      })
      .then((response) => {
        handleStateRegister();
        SetMessageState("Registrado com sucesso!");
        SetErrorState(null);
        return response;
      })
      .catch((error) => {
        const { message } = error.response.data;
        SetErrorState(message);
        return message;
      });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm  bg-repeat z-50">
      {stateRegister === false ? (
        <Card className="w-full max-w-sm shadow-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">
              Faça o login com sua conta
            </CardTitle>
            <CardDescription className="text-gray-200">
              Para acessar o Dashboard é necessário realizar o login
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messageState && (
              <small className="flex items-center justify-center gap-1 text-green-500 font-bold p-2 bg-green-100 rounded-lg">
                <SealCheckIcon size={22} />
                {messageState}
              </small>
            )}
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="flex flex-col gap-6 text-white">
                <small className="text-orange-500">{errorState}</small>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="m@exemplo.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <small className="text-red-400">
                      {errors.email.message}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-white">
                      Senha
                    </Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm text-gray-200 underline-offset-4 hover:underline"
                    >
                      esqueceu sua senha?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                </div>
                <div className="grid gap-2">
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  <Button
                    onClick={handleStateRegister}
                    variant="outline"
                    className="w-full text-black"
                  >
                    Crie sua conta
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm shadow-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Crie sua conta</CardTitle>
            <CardDescription className="text-gray-200">
              Para acessar o Dashboard é necessário criar uma conta
            </CardDescription>
            <small className="text-orange-500">{errorState}</small>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRegister)}>
              <div className="flex flex-col gap-6 text-white">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-white">
                    nome
                  </Label>
                  <Input
                    id="name"
                    type="name"
                    placeholder="john Doe"
                    {...register("name")}
                    required
                  />
                  {errors.name && (
                    <small className="text-orange-500">
                      {errors.name.message}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="useName" className="text-white">
                    nome de usuário
                  </Label>
                  <Input
                    id="userName"
                    placeholder="User_exemplo"
                    {...register("userName")}
                    required
                  />{" "}
                  {errors.userName && (
                    <small className="text-orange-500">
                      {errors.userName.message}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="m@exemplo.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <small className="text-orange-500">
                      {errors.email.message}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-white">
                      Senha
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />{" "}
                  {errors.password && (
                    <small className="text-orange-500">
                      {errors.password.message}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <Button type="submit" className="w-full">
                    Cadastre-se
                  </Button>
                  <Button
                    onClick={handleStateRegister}
                    variant="link"
                    className="w-full text-white"
                  >
                    <ArrowArcLeftIcon /> voltar
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
