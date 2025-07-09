import { ChevronRight, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

  const handleNavigate = (url: string) => {
    navigate(url)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          !item.items ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} className="flex items-center w-full">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon onClick={() => handleNavigate(item.url)} className="cursor-pointer" />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
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
