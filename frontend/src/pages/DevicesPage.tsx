import { useState } from "react"
import { DevicesTable } from "@/components/devicestable"
import { DeviceCard } from "@/components/devicecard"
import { DevicesStatsSummary } from "@/components/devicestatssummary"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Loader2, Monitor, Table } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import { useDevices } from "@/hooks/useDevices"
import { cn } from "@/lib/utils"

const DevicesPage = () => {
  const [view, setView] = useState<"table" | "card">("table")
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "blocked">("all")

  const { data: devices = [], isLoading } = useDevices(2)

  if (isLoading) {
    return <div className="h-full w-full flex flex-col justify-center items-center gap-4"><Loader2 className="h-16 w-16 animate-spin" /><p className="text-lg ">LOADING DEVICES</p></div>
  }

  const filteredDevices = devices.filter((d: any) => {
    if (filter === "online") return d.status === "UP"
    if (filter === "offline") return d.status === "DOWN"
    if (filter === "blocked") return !d.authorized
    return true
  })

  const totalDevices = devices.length
  const onlineDevices = devices.filter((d: any) => d.status === "UP").length
  const blockedDevices = devices.filter((d: any) => d.blocked).length

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <DevicesStatsSummary devices={devices} />

        {/* Filters + view toggle */}
        <section className="flex flex-row items-center justify-between gap-3 mt-2">
          <div className="flex flex-wrap gap-2">
            <Badge
              className="cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Devices ({totalDevices})
            </Badge>
            <Badge
              className="cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md"
              variant={filter === "online" ? "default" : "outline"}
              onClick={() => setFilter("online")}
            >
              Online ({onlineDevices})
            </Badge>
            <Badge
              className="cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md"
              variant={filter === "offline" ? "default" : "outline"}
              onClick={() => setFilter("offline")}
            >
              Offline ({totalDevices - onlineDevices})
            </Badge>
            <Badge
              className="cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md"
              variant={filter === "blocked" ? "default" : "outline"}
              onClick={() => setFilter("blocked")}
            >
              Blocked ({blockedDevices})
            </Badge>
          </div>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(val: string) => setView(val as "table" | "card")}
            className="inline-flex rounded-md border bg-background"
          >
            <ToggleGroupItem
              value="table"
              disabled={view === "table"}
              className={cn(
                "flex items-center px-3 py-1 text-sm font-medium rounded-l-md",
                view === "table"
                  ? "bg-primary text-primary-foreground cursor-not-allowed"
                  : "bg-background text-primary hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Table className="w-4 h-4 mr-1" /> Table
            </ToggleGroupItem>

            <ToggleGroupItem
              value="card"
              disabled={view === "card"}
              className={cn(
                "flex items-center px-3 py-1 text-sm font-medium rounded-r-md",
                view === "card"
                  ? "bg-primary text-primary-foreground cursor-not-allowed"
                  : "bg-background text-primary hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Monitor className="w-4 h-4 mr-1" /> Cards
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        {/* Device list */}
        <section className="mt-2">
          {view === "table" ? (
            <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4">
              <DevicesTable devices={filteredDevices} viewType="all" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((d: any) => <DeviceCard key={d.uid} {...d} />)
              ) : (
                <div className="text-muted-foreground text-sm col-span-full text-center py-8">
                  No devices found.
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </SidebarInset>
  )
}

export default DevicesPage
