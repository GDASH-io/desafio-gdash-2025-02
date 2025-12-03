import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/useRegister";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { type RegisterFormData, registerSchema } from "./schema";

export function Register() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    mode: "onChange",
  });

  const { mutate } = useRegister();
  const handleSubmit = form.handleSubmit(({ email, password, name }) => {
    mutate({ email, password, name });
  });
  return (
    <div className="flex w-full h-full">
      <div className="w-full  h-full flex flex-col justify-center items-center p-8 ">
        <div className="flex flex-col justify-center w-full max-w-lg">
          <div>
            <h1 className="text-center font-bold text-2xl">Cadastre-se</h1>
            <p className="text-center font-normal ">
              Ja tem uma conta?{" "}
              <span>
                {" "}
                <Link to="/login" className="text-amber-500 font-medium">
                  Fazer login
                </Link>{" "}
              </span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4 mt-10">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nome Completo"
                        {...field}
                        type="text"
                        className="h-[52px]"
                      />
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
                    <FormControl>
                      <Input
                        placeholder="Email"
                        {...field}
                        type="email"
                        className="h-[52px]"
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
                    <FormControl>
                      <Input
                        placeholder="Senha"
                        {...field}
                        type="password"
                        className="h-[52px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-[54px] w-full bg-teal-9 hover:bg-teal-7 rounded-2xl"
              >
                Entrar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
