import * as React from "react"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import { SidebarLogo } from "@/components/sidebar/sidebar-logo"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { sidebarNavs } from "@/constants/constants"
import { SecondNavs } from "./nav-second-group"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo team={sidebarNavs.team} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarNavs.sidebarNavsMain} />
        <SecondNavs items={sidebarNavs.sidebarNavsSecond} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarNavs.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
