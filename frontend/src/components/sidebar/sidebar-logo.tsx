import * as React from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

export function SidebarLogo({ team }: { team: Team }) {
  const { toggleSidebar } = useSidebar()

  return (
    <SidebarMenu onClick={toggleSidebar}>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default bg-sidebar-accent text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <team.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{team.name}</span>
            <span className="truncate text-xs">{team.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
