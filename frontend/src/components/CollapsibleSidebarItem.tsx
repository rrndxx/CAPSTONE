// components/CollapsibleSidebarItem.tsx
import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  icon: React.ReactNode
  children: { title: string; url: string, icon: ReactNode}[]
}

export const CollapsibleSidebarItem = ({ nav }: { nav: NavItem }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SidebarMenuButton onClick={() => setOpen(!open)} title={nav.title}>
        {nav.icon}
        <span className="flex-1 text-sm">{nav.title}</span>
        {open ? (
          <ChevronDown className="ml-auto size-4" />
        ) : (
          <ChevronRight className="ml-auto size-4" />
        )}
      </SidebarMenuButton>

      {open && (
        <SidebarMenuSub>
          {nav.children.map((child) => (
            <SidebarMenuSubItem key={child.title}>
              <SidebarMenuSubButton asChild>
                <Link to={child.url}>{child.icon}{child.title}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </>
  )
}
