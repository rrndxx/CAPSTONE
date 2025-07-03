import { Bell, Settings, User } from "lucide-react"
// import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "./ui/mode-toggle"

const Navbar = () => {
  return (
    <nav className="flex p-4 items-center justify-between">
      {/* left */}
      <div className="text-md font-extralight">Hello, Admin!</div>

      {/* right */}
      <div className="flex items-center gap-4">
        {/* <Link to="/dashboard">Dashboard</Link> */}

        {/* Theme toggle button */}
        <ModeToggle />

        {/* Notifications button ni */}
        <Button variant="outline" size="icon" >
          <Bell className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <Bell className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        </Button>


        {/* Profile Dropdown ni */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://avatars.githubusercontent.com/u/163083905?s=400&u=43d0e424d2bb037322a5ae668d9db4fe3d32e00e&v=4" />
              <AvatarFallback>N</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-[1.2rem] w-[1.2rem] mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem >
              <Settings className="h-[1.2rem] w-[1.2rem] mr-2" /> Settings
            </DropdownMenuItem>
            {/* <DropdownMenuItem variant="destructive">
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" /> Logout
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div >
    </nav >
  )
}

export default Navbar