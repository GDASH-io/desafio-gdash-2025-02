import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { TypographyH4, TypographyMuted } from "../ui/tipography";
import { ChartLineIcon, ChevronUp, CloudIcon, HomeIcon, LogOutIcon, User, UserIcon, type LucideIcon } from "lucide-react";
import { RouterLink } from "../RouterLink";
import {useAtomValue } from "jotai";
import { userAtom } from "@/atom/store";
import { Activity } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { useLogout } from "@/hooks/useLogout";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { MOBILE_BREAKPOINT } from "@/hooks/use-mobile";

type AppSidebarProps = {
  userName?: string;
  userEmail?: string
}

export function AppSideBar({ userName = "joao", userEmail = "joao@email.com" }: AppSidebarProps) {
  const {logout} = useLogout();
  const windowWidth = useWindowWidth()

  const { isMobile, openMobile, setOpen, setOpenMobile, open, } = useSidebar();
  const user = useAtomValue(userAtom);

  const handleToggle = () => {
    if (isMobile) {
      setOpenMobile(!openMobile)
    }
  }

  const menuItems: { title: string, role?: string, links: [{ name: string, url: string, icon: LucideIcon }] }[] = [
    {
      title: "Principal",
      links: [{
        name: "Início",
        url: "/dashboard",
        icon: HomeIcon
      }]
    },
    {
      title: "Análise",
      links: [
        {
          name: "Gráficos",
          url: "/dashboard/graphics",
          icon: ChartLineIcon
        }
      ]
    }, {
      title: "Usuários",
      role: "admin",
      links: [
        {
          name: "Usuários",
          url: "/dashboard/users",
          icon: User
        }
      ]
    }
  ]

  return (
    <Sidebar variant="inset">
      <Activity mode={open || openMobile ? "visible" : "hidden"}>
        <SidebarHeader className="text-center text-2xl">
          <h1 className="flex font-semibold justify-center items-center gap-2">
            <span>Clima Logs</span>
            <CloudIcon size={40} />
          </h1>
        </SidebarHeader>
        <Separator />
      </Activity>

      <SidebarContent>
        {menuItems.map((item) => {

          if(!user?.isAdmin && item.role && item.role === "admin") {
            return
          }

          return <SidebarGroup key={"group-" + item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarMenu>
              {item.links.map(link => (
                <SidebarMenuItem key={link.name}>
                  <SidebarMenuButton asChild className="flex gap-3 h-10">
                    <RouterLink url={link.url} className="flex" onClick={handleToggle}>
                      <link.icon />
                      <TypographyH4>{link.name}</TypographyH4>
                    </RouterLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        })}
      </SidebarContent>

      <SidebarFooter>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="h-12">
                <SidebarMenuButton>
                  <Activity mode={open || openMobile ? "visible" : "hidden"}>
                    <div className="w-9 h-9 bg-accent flex items-center justify-center rounded-full"><b>{userName.charAt(0).toUpperCase()}</b></div>
                    <div className="flex flex-col">
                      <span>{userName}</span>
                      <TypographyMuted>{userEmail}</TypographyMuted>
                    </div>
                  </Activity>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                className={`${(open || openMobile) ? "w-60 p-1.5" : "min-w-1 p-1.5"} bg-accent flex flex-col rounded-2xl border`}
              >
                <DropdownMenuItem
                  className={`cursor-pointer ${(open || openMobile) && "rounded-[0.4rem]"} flex items-center gap-2 p-1.5`}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false)
                    else if(windowWidth < MOBILE_BREAKPOINT) setOpen(false)
                  }}
                >
                  <UserIcon size={open || openMobile ? 25 : 20} />
                  {(open || openMobile) && <RouterLink url="/dashboard/account"><b>Conta</b></RouterLink>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false)
                    } else {
                      setOpen(false)
                    }
                    logout()
                  }}
                  className={`cursor-pointer ${open || openMobile && "rounded-[0.4rem]"} flex items-center gap-2 text-destructive p-1.5`}
                >
                  <LogOutIcon size={open || openMobile ? 25 : 20} />
                  {(open || openMobile) && <span><b>Sair</b></span>}
                </DropdownMenuItem>
              </DropdownMenuContent>

            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar >
  )
}