import { useState } from "react"
import { useLogin } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const { login, loading, error } = useLogin()
  const [email, setEmail] = useState("admin@gdash.com")
  const [password, setPassword] = useState("admin123")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login({ email, password })
    } catch {
      // erro já tratado no hook
    }
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Acesse sua conta
          </h1>
          <p className="text-sm text-slate-400">
            Entre com suas credenciais de administrador
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-900/30 border border-red-800 text-red-200 text-sm flex items-center">
              <span className="font-medium">Erro:</span>&nbsp;{error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">E-mail</Label>
            <Input 
              id="email" 
              placeholder="nome@exemplo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white focus-visible:ring-blue-600"
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Autenticando...
              </div>
            ) : "Entrar no Dashboard"}
          </Button>
        </form>
        
        <p className="px-8 text-center text-sm text-slate-500">
          Ao clicar em entrar, você concorda com nossos termos de serviço e política de privacidade.
        </p>
      </div>
    </div>
  )
}
