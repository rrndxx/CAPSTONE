import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles, Moon, Sun, CogIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/provider/ThemeProvider"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

type navUserProps = {
  name: string
  email: string
  avatar: string
}

export function NavUser({ user }: { user: navUserProps }) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const navigate = useNavigate()
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }
  const queryClient = useQueryClient()

  const handleSignout = (url: string) => {
    localStorage.removeItem("token")

    queryClient.clear()

    navigate(url)
  }


  const menuItems = [
    {
      icon: isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />,
      label: `Switch to ${isDark ? "Light" : "Dark"} Mode`,
      custom: <Switch checked={isDark} onCheckedChange={toggleTheme} />,
    }
  ]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">N</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup className="mt-2">
              {menuItems.map((item, index) => (
                <DropdownMenuItem asChild key={index}>
                  <div className="flex w-full items-center justify-between gap-4 px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.custom}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleSignout('/')}>
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="ml-2 text-red-400">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
