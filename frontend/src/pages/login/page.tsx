import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cloud, Mail, Lock, ArrowRight } from "lucide-react";
import { type LoginFormValues, loginSchema } from "./schema";
import { useLoginPage } from "./useLoginPage";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { onSubmit } = useLoginPage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom_right,var(--primary)/0.05,var(--background),var(--secondary)/0.05)] p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2">
        <CardHeader className="space-y-6 pb-10 pt-10 px-8">
          <div className="flex flex-col items-center space-y-5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <div className="relative bg-[linear-gradient(to_bottom_right,#3B82F6,#2563EB)] p-4 rounded-2xl shadow-lg">
                <Cloud className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-heading font-bold bg-[linear-gradient(to_right,var(--primary),var(--secondary))] bg-clip-text text-transparent">
                GDash
              </CardTitle>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Weather Dashboard
              </p>
            </div>
          </div>
          <CardDescription className="text-center text-base pt-2">
            Entre para monitorar dados climáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="Email"
              labelIcon={<Mail className="w-4 h-4 text-primary" />}
              placeholder="seu@email.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <PasswordInput
              id="password"
              label="Senha"
              labelIcon={<Lock className="w-4 h-4 text-primary" />}
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group mt-2"
              size="lg"
            >
              Entrar
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
