import { CloudSun, LayoutDashboard, LogOut, Moon, Rocket, Sun, User } from "lucide-react"
import { Button } from "./ui/button"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useTheme } from "@/hooks/useTheme"

export const SideBar = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const { theme, toggleTheme } = useTheme()

    const handleLogout = () => {
        localStorage.removeItem('gdash_token')
        navigate({ to: '/auth/login' })
    }

     const getButtonClass = (path: string) => {
        const isActive = location.pathname === path
        return isActive
          ? "w-full justify-start bg-muted text-primary hover:text-primary hover:bg-muted cursor-pointer"
          : "w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
      }
    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <CloudSun className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">GDASH</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
              variant="ghost" 
              className={getButtonClass('/dashboard')}
              onClick={() => navigate({ to: '/dashboard' })}
              >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button 
              variant="ghost" 
              className={getButtonClass('/dashboard/users')}
              onClick={() => navigate({ to: '/dashboard/users' })}
          >
            <User className="mr-2 h-4 w-4" /> Usuários
          </Button>
          <Button 
            variant="ghost" 
            className={getButtonClass('/dashboard/explorer')}
            onClick={() => navigate({ to: '/dashboard/explorer' })} 
          >
            <Rocket className="mr-2 h-4 w-4" /> Explorador
          </Button>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
            {theme === 'light' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950/30" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
          </Button>
        </div>
      </aside>
    )
}