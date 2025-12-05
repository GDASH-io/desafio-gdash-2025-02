import { LoginForm } from "@/components/LoginForm";
import { TypographyH1 } from "@/components/ui/tipography";
import { cn } from "@/lib/utils";
import { CloudIcon } from "lucide-react";
import { useEffect } from "react";

export function LoginPage() {

  useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
  }, []);

  return <main className={cn("flex flex-col items-center justify-center gap-6 h-svh w-full")}>
    <TypographyH1>
      <p className="flex gap-1 items-center justify-center">
        Clima Logs
        <CloudIcon size={40} />
      </p>
    </TypographyH1>
    <LoginForm />
  </main>
}