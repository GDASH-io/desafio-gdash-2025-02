import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { Button } from "@/components/ui/button"
import { Sun, Moon, ExternalLink, Download } from "lucide-react"
import { useTheme } from "./lib/theme"
import Dashboard from "./dashboard"
import { RequestLogout, RequestSessionState, type SessionStateResponse } from "./lib/client"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { useNavigate } from "react-router"
import { RequestDownloadFile } from "./lib/downloadClient"

export default function Index() {
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState<SessionStateResponse | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    RequestSessionState().then((data) => {
      if(data && data.user != undefined) {
        setSession(data)
        return
      }
      navigate("/auth")
    })
  }, [])

  const logoutButton = async () => {
    const resp = await RequestLogout()
    if (resp?.goToPage) {
      window.location.href = resp.goToPage
    }
  }

  return (
    <div className="w-screen lg:h-screen">
      <SidebarProvider
        defaultOpen={false}
        className={`h-full w-full overflow-x-hidden transition-colors ${theme === 'dark'
          ? 'bg-linear-to-br from-slate-950 via-zinc-950 to-slate-900'
          : 'bg-linear-to-br from-slate-50 via-zinc-50 to-slate-100'
          }`}>
        <Sidebar variant="inset">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Links</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => {window.open("/pokedex")}} className="cursor-pointer">
                      <ExternalLink></ExternalLink>
                      <span>Pokedex</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Exportar</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="cursor-pointer" onClick={() => {RequestDownloadFile("/api/export/dayCsv")}}>
                      <Download></Download>
                      <span>Previsão Diária CSV</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="cursor-pointer" onClick={() => {RequestDownloadFile("/api/export/dayXlsx")}}>
                      <Download></Download>
                      <span>Previsão Diária XLSX</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="cursor-pointer" onClick={() => {RequestDownloadFile("/api/export/hourlyCsv")}}>
                      <Download></Download>
                      <span>Previsão horária CSV</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="cursor-pointer" onClick={() => {RequestDownloadFile("/api/export/hourlyXlsx")}}>
                      <Download></Download>
                      <span>Previsão horária XLSX</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col w-full min-w-0 h-full min-h-0">
          <header className={`flex justify-between items-center gap-2 p-2 shrink-0 ${theme === 'dark' ? 'text-zinc-50' : 'text-zinc-900'
            }`}>
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" />
              <h1>Painel</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full">
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
              </Button>
              <div>
                {session?.user != undefined && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="rounded-lg">
                        <AvatarImage className="rounded-xl w-8 h-8" src={`https://api.dicebear.com/9.x/initials/svg?seed=${session.user.display_name.split(" ")[0]}`} />
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-20">
                      <Button onClick={logoutButton}>Sair</Button>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>
          <div className="flex-1 min-h-0">
            <Dashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}