import AppSidebar from "./components/AppSidebar"
import Navbar from "./components/Navbar"
import { type ReactNode } from "react"
import { SidebarProvider } from "./components/ui/sidebar"

type Props = {
  children: ReactNode
}

const App = ({ children }: Props) => {
  return (
    <div className="flex">
      <SidebarProvider defaultOpen = {false}>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="px-4 pb-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default App