import { LayoutDashboard, Cloud, Activity, LogOut, Info, Layers, Users, Tv } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

const items = [
  { title: "Painel", url: "/dashboard", icon: LayoutDashboard },
  { title: "Dados Climáticos", url: "/weather", icon: Cloud },
  { title: "Tempo Real", url: "/realtime", icon: Activity },
  { title: "Sobre", url: "/about", icon: Info },
  { title: "Arquitetura", url: "/architecture", icon: Layers },
  { title: "Usuários", url: "/users", icon: Users },
  { title: "Rick & Morty", url: "/rick-and-morty", icon: Tv },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/");
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6">
          <h1 className={`font-bold text-xl bg-gradient-primary bg-clip-text text-transparent ${isCollapsed ? "text-center text-sm" : ""}`}>
            {isCollapsed ? "CS" : "Climate Sync"}
          </h1>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-full justify-center text-muted-foreground hover:text-destructive"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
