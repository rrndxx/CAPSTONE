import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import { type ReactNode } from "react"

type Props = {
  children: ReactNode
}

const App = ({ children }: Props) => {
  return (  
    <div className="flex">
      <Sidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </div>
  )
}

export default App