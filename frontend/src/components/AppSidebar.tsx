import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar"
import { Link } from "react-router-dom"
import { LogOut, Wifi } from "lucide-react"
import { sidebarNavs } from "@/constants/sidebarnavs"
import { CollapsibleSidebarItem } from "@/components/CollapsibleSidebarItem"

const AppSidebar = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar} asChild >
              <span className="flex justify-center items-center cursor-pointer">
                <span></span><Wifi /><span >Netdetect</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader >

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavs.map((nav) => (
                <SidebarMenuItem key={nav.title}>
                  {"children" in nav && nav.children ? (
                    <CollapsibleSidebarItem nav={nav} />
                  ) : (
                    <SidebarMenuButton asChild title={nav.title}>
                      <Link to={nav.url!}>
                        {nav.icon}
                        <span className="text-sm">{nav.title}{nav.title === "Alerts" && (
                          <SidebarMenuBadge className="absolute top-1.5 right-2 bg-red-500 text-white">
                            5
                          </SidebarMenuBadge>
                        )}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuButton asChild title="Logout" className="text-red-600 text-sm">
            <Link to="/logout" >
              <LogOut /> Logout
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar >
  )
}

export default AppSidebar