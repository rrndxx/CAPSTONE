import { useState } from "react"
import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { DeviceCard } from "@/components/devicecard"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Monitor, Table } from "lucide-react"
import { DevicesStatsSummary } from "@/components/devicestatssummary"
import { Badge } from "@/components/ui/badge"
import { devices } from "@/constants/constants"

const DevicesPage = () => {
  const [view, setView] = useState<"table" | "card">("table")
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "blocked">("all")

  const filteredDevices = devices.filter((d) => {
    if (filter === "online") return d.status === "Online"
    if (filter === "offline") return d.status === "Offline"
    if (filter === "blocked") return d.blocked
    return true
  })

  const totalDevices = devices.length
  const onlineDevices = devices.filter(d => d.status === "Online").length
  const blockedDevices = devices.filter(d => d.blocked).length

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">

        {/* 🧠 Summary Section */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Network Overview</h2>
          <DevicesStatsSummary devices={devices} />
        </section>

        <section className="flex flex-col sm:flex-row md:items-center md:justify-between gap-3">
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
            onValueChange={(val: string) => {
              if (val === "card" || val === "table") setView(val)
            }}
            className="bg-muted rounded-md"
          >
            <ToggleGroupItem value="table" aria-label="Table View">
              <Table className="w-4 h-4 mr-1" /> Table
            </ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="Card View">
              <Monitor className="w-4 h-4 mr-1" /> Cards
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        {/* 📦 Devices List */}
        <section className="mt-2">
          {view === "table" ? (
            <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4">
              {filteredDevices.length > 0 ? (
                <DevicesTable devices={filteredDevices} />
              ) : (
                <div className="text-muted-foreground text-sm text-center py-8">
                  No devices match the filter.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((d) => (
                  <DeviceCard key={d.uid} {...d} />
                ))
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
