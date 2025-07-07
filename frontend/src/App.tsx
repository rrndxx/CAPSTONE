import AppSidebar from "./components/AppSidebar"
import Navbar from "./components/Navbar"
import { SidebarProvider } from "./components/ui/sidebar"
import { Outlet } from "react-router-dom"

const App = () => {
  return (
    <div className="flex">
      <SidebarProvider defaultOpen = {false}>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="pb-4"><Outlet /></div>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default App