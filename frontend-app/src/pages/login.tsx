import { LoginBranding, LoginForm } from "@/components/login"

export function Login() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 bg-slate-950 text-white">
      <LoginBranding />
      <LoginForm />
    </div>
  )
}
