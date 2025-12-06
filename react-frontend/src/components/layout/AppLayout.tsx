import { NavLink, Outlet } from 'react-router-dom';
import { PanelLeft, LayoutDashboard, Users, Power, CircleUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export function AppLayout() {
  const { logout, user } = useAuth();

  const NavLinks = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <NavLink
        to="/"
        className={({ isActive }) => `
          flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary
          ${isActive ? 'bg-muted text-primary' : ''}
        `}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>
      

      {user?.typer_usuario === 'A' && (
        <NavLink
          to="/users"
          className={({ isActive }) => `
            flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary
            ${isActive ? 'bg-muted text-primary' : ''}
          `}
        >
          <Users className="h-4 w-4" />
          Usuários
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/** Desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold">
              <span className="">GDASH</span>
            </NavLink>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <NavLinks />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Abrir menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              {/**  MOBILE */}
              <nav className="grid gap-2 text-lg font-medium">
                <NavLink to="/" className="mb-4 flex items-center gap-2 text-lg font-semibold">GDASH</NavLink>
                <NavLink to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"><LayoutDashboard className="h-5 w-5" />Dashboard</NavLink>
                
                {user?.typer_usuario === 'A' && (
                  <NavLink to="/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"><Users className="h-5 w-5" />Usuários</NavLink>
                )}
              </nav>

            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1" /> 

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.typer_usuario === 'A' ? 'Admin' : 'Usuário'}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <Power className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}