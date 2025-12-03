import { Button } from "@/components/ui/button";

import { Header } from "@/components/Header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetUser } from "@/hooks/useGetUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateSchema, type UpdateFormData } from "./schema";

export function Update() {
  const { data: user } = useGetUser();
  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      email: user?.email,
      name: user?.name,
    },
    mode: "onChange",
  });

  const { mutate } = useUpdateUser();
  const handleSubmit = form.handleSubmit(({ email, name }) => {
    mutate({ email, name });
  });
  return (
    <>
      <Header email={user?.email} userName={user?.name} />
      <div className="flex w-full h-full">
        <div className="w-full  h-full flex flex-col justify-center items-center p-8 ">
          <div className="flex flex-col justify-center w-full max-w-lg">
            <div>
              <h1 className="text-center font-bold text-2xl">
                Atualize sua conta
              </h1>
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
                          placeholder="Nome completo"
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

                <Button
                  type="submit"
                  className="h-[54px] w-full bg-teal-9 hover:bg-teal-7 rounded-2xl"
                >
                  Atualizar
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
