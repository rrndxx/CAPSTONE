import { Wifi } from 'lucide-react'
import { useSidebar } from './ui/sidebar'
import { useLocation } from 'react-router-dom'
import { routes } from "@/constants/routes"

const Navbar = () => {
    const { toggleSidebar } = useSidebar()
    const location = useLocation()
    const pathname = location.pathname

    const title = routes[pathname] || "Page"

    return (
        <header className="flex h-20 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-data-[collapsible=collapsed]/sidebar-wrapper:h-16">
            <div className="flex items-center gap-3 md:hidden cursor-pointer" onClick={toggleSidebar}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Wifi className="size-4" />
                </div>
                <div className="text-xl font-semibold">NetDetect</div>
            </div>
            <div className="hidden md:block text-2xl font-semibold">{title}</div>
        </header >
    )
}

export default Navbar