import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useLocation, useNavigate } from "react-router-dom"

type navProps = {
  title: string
  url: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items }: { items: navProps[] }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (url: string) => location.pathname === url
  const isParentActive = (parentUrl: string, subItems?: { url: string }[]) =>
    location.pathname.startsWith(parentUrl) ||
    subItems?.some((sub) => location.pathname === sub.url)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          !item.items ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className={isActive(item.url) ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}
                onClick={() => navigate(item.url)}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" onClick={() => navigate(item.url)}/>}
                <span className="cursor-pointer">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
              defaultOpen={isParentActive(item.url, item.items)} // auto-expand if active
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      isParentActive(item.url, item.items)
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : ""
                    }
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" onClick={() => navigate(item.url)}/>}
                    <span className="cursor-pointer">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          className=" cursor-pointer" onClick={() => navigate(subItem.url)}
                        >
                          {subItem.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
