import AuditTrailCard from "@/components/AuditTrailCard"
import Barchart from "@/components/Barchart"
import { Linechart } from "@/components/Linechart"
import { Piechart } from "@/components/Piechart"
import { History } from "lucide-react"
import { cn } from "@/lib/utils"

const Homepage = () => {
  const cardSettings = "grid grid-cols-1 gap-4"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 p-4">
      {/* Left Column */}
      <div className={cn(cardSettings, "lg:col-span-1 flex flex-col justify-between")}>
        <div className="flex flex-col gap-4">
          <Piechart />
          <Piechart />
        </div>

        <div className="bg-primary-foreground p-4 rounded-lg h-102">
          Some Content
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold">Previous Actions</h1>
            <History className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg h-58 ">
            <AuditTrailCard />
          </div>
        </div>
      </div>

      {/* Center Column */}
      <div className={cn(cardSettings, "lg:col-span-3")}>
        <div className="bg-primary-foreground rounded-lg p-4">
          <Linechart />
        </div>
        <div className="bg-primary-foreground rounded-lg p-4">
          <Barchart />
        </div>
      </div>

      {/* Right Column */}
      <div className={cn(cardSettings, "lg:col-span-2")}>
        <div className="bg-primary-foreground p-4 rounded-lg h-48">Div 5</div>
        <div className="bg-primary-foreground p-4 rounded-lg h-48">Div 6</div>
      </div>
    </div>
  )
}

export default Homepage
