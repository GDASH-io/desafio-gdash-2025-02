import {
  PencilSimpleIcon,
  ProhibitIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import z from "zod";
import { Axios } from "../lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const userValidationSchema = z.object({
  user: z.string().min(1, "Seu nome deve ter mais caracteres"),
  userName: z.string().min(1, "Seu nome de usuário deve ter mais caracteres"),
  email: z.email("Insira um e-mail válido").optional(),
  password: z
    .string()
    .min(8, "Sua senha deve ter no mínimo 8 caracteres")
    .optional(),
});

type UserValidationSchema = z.infer<typeof userValidationSchema>;

export function PopoverDashboad() {
  const [data, SetData] = useState<UserValidationSchema>({
    user: "",
    email: "",
    userName: "",
  });

  const token = Cookies.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserValidationSchema>({
    resolver: zodResolver(userValidationSchema),
  });

  async function handleEditUser({
    user,
    userName,
    password,
  }: UserValidationSchema) {
    const response = await Axios.post(
      "edit/account",
      {
        name: user,
        userName,
        email: data.email,
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    window.location.reload()
    return response.data;
  }

  async function handleDeleteUser() {
    const response = await Axios.post(
      "delete/account",
      {
        email: data.email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Cookies.remove("token");
    window.location.reload();
    return response;
  }

  useEffect(() => {
    if (!token) return;
    Axios.get("/get/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const { userPresenter } = response.data;
        const parsedUsePresenter = userValidationSchema.parse(userPresenter);
        SetData(parsedUsePresenter);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }, [token]);

  function handleLoggout() {
    Cookies.remove("token");
    window.location.reload();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <CardTitle className="flex items-center justify-around p-2 text-white bg-blue-400 rounded-bl-lg rounded-tr-lg">
          <UserCircleIcon size={42} weight="fill" />
          <div className="grid gap-2 ">
            <p>{data.userName}</p>
            <small>{data.email}</small>
          </div>
        </CardTitle>
      </PopoverTrigger>
      <PopoverContent className="grid items-center gap-1 w-80">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="flex gap-2 items-center " variant="link">
              <PencilSimpleIcon color="blue" size={32} />
              Editar usuário
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Dados de Usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Modifique seus dados abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* FORMULÁRIO CORRETO AQUI */}
            <form
              onSubmit={handleSubmit(handleEditUser)}
              className="grid gap-3 mt-3"
            >
              <Input placeholder="Insira seu novo nome" {...register("user")} />
              {errors.user && (
                <small className="text-orange-500">{errors.user.message}</small>
              )}
              <Input
                placeholder="Insira seu novo nome de usuário"
                {...register("userName")}
              />
              {errors.userName && (
                <small className="text-orange-500">
                  {errors.userName.message}
                </small>
              )}

              <Input
                placeholder="Insira sua nova senha"
                {...register("password")}
              />
              {errors.password && (
                <small className="text-orange-500">
                  {errors.password.message}
                </small>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>

                {/* ESTE botão envia o formulário */}
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 text-white"
                >
                  Salvar
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="flex gap-2 items-center " variant={"link"}>
              <ProhibitIcon color="red" size={32} /> <p>Deletar conta</p>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Excluir conta</DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>
                  Tem certeza que deseja excluir sua conta?
                </AlertTitle>
                <AlertDescription>
                  <p>
                    A exclusão da sua conta é permanente e não pode ser
                    desfeita. Todos os seus dados serão removidos
                    definitivamente do sistema. Você perderá acesso aos seus
                    projetos, histórico e configurações. Essa ação é
                    irreversível e afetará todas as funcionalidades vinculadas.
                    Leia atentamente os itens abaixo antes de continuar.
                  </p>
                  <ul className="list-inside list-disc text-sm">
                    <li>Perda total dos seus dados pessoais</li>
                    <li>Exclusão de todos os projetos e publicações</li>
                    <li>Remoção de históricos, comentários e interações</li>
                    <li>Cancelamento imediato de qualquer assinatura ativa</li>
                    <li>Impossibilidade de recuperar a conta futuramente</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <DrawerFooter>
                <Button
                  onClick={handleDeleteUser}
                  className="bg-red-600 hover:bg-red-500 text-red-50 font-bold"
                >
                  Sim, Exclua essa conta.
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">
                    Não, Desejo continuar o acesso
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
        <Button onClick={handleLoggout} variant={"destructive"}>
          Loggout
        </Button>
      </PopoverContent>
    </Popover>
  );
}
