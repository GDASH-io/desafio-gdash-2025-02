
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { useSignUpController } from "./useSignUpController";


function SignUp() {
  const {
    form,
    onSubmit,
  } = useSignUpController();

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-10">
      <p className="text-4xl font-bold">Crie sua conta</p>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8 w-1/4">
         <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Seu nome"
                    type="text"
                    {...field}
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@gmail.com"
                    type="email"
                    {...field}
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="**********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Criar Conta"}
          </Button>
        </form>
      </Form>
       <Link to="/signin" className="text-sm">
        <p className="text-muted-foreground hover:text-gray-600">Já tem uma conta? Faça login agora!</p>
      </Link>
    </div>
  );
}

export default SignUp;
