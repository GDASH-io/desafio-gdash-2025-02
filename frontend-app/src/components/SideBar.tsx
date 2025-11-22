import { CloudSun, LayoutDashboard, LogOut, Rocket, User } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "@tanstack/react-router"

export const SideBar = () => {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('gdash_token')
        navigate({ to: '/auth/login' })
    }
    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CloudSun className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">GDASH</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-slate-800 text-blue-400 hover:bg-slate-800 hover:text-blue-400">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => navigate({ to: '/users' })}
          >
            <User className="mr-2 h-4 w-4" /> Usuários
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            onClick={() => navigate({ to: '/explorer' })} // <--- AQUI
          >
            <Rocket className="mr-2 h-4 w-4" /> Explorador (Bônus)
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
          </Button>
        </div>
      </aside>
    )
}