import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

type NavItem = {
    title: string
    url: string
    icon?: LucideIcon
}

export function SecondNavs({ items }: { items: NavItem[] }) {
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (url: string) => location.pathname === url

    return (
        <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            tooltip={item.title}
                            onClick={() => navigate(item.url)}
                            className={`flex items-center w-full ${isActive(item.url)
                                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                    : ""
                                }`}
                        >
                            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
