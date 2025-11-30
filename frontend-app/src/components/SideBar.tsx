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
          ? "w-full justify-start bg-muted text-primary hover:text-primary hover:bg-muted cursor-pointer font-medium"
          : "w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
    }

    return (
        <aside className="w-64 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col z-50">
            <div className="p-6 flex items-center gap-2 border-b border-sidebar-border shrink-0">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                    <CloudSun className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-foreground">GDASH</span>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
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
                    className={getButtonClass('/explorer')} 
                    onClick={() => navigate({ to: '/dashboard/explorer' })} 
                >
                    <Rocket className="mr-2 h-4 w-4" /> Explorador
                </Button>
            </nav>

            <div className="p-4 border-t border-sidebar-border space-y-2 shrink-0">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={toggleTheme}>
                    {theme === 'light' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
                </Button>
            </div>
        </aside>
    )
}