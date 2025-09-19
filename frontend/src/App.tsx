import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Outlet } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar"
import Navbar from "./components/navbar"

export function LayoutWrapper() {
  const { state } = useSidebar()

  return (
    <div
      className="
    flex w-full transition-all
    md:data-[collapsible=collapsed]/pl-0
    md:data-[collapsible=expanded]/pl-64
  "
      data-collapsible={state}
    >
      <AppSidebar />
      <main className="flex-1">
        <Navbar />
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <SidebarProvider>
      <LayoutWrapper />
    </SidebarProvider>
  )
}
