import { useState } from "react"
import { DevicesTable } from "@/components/devicestable"
import { DeviceCard } from "@/components/devicecard"
import { DevicesStatsSummary } from "@/components/devicestatssummary"
import { Badge } from "@/components/ui/badge"
import { Loader2, Monitor, Table } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import { useDevices } from "@/hooks/useDevices"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DevicesPage = () => {
  const [view, setView] = useState<"table" | "card">("table")
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "blocked">("all")

  const { data: devices = [], isLoading } = useDevices(2)

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="text-lg">LOADING DEVICES</p>
      </div>
    )
  }

  const filteredDevices = devices.filter((d: any) => {
    if (filter === "online") return d.status === "UP"
    if (filter === "offline") return d.status === "DOWN"
    if (filter === "blocked") return d.trustStatus === "BLACKLISTED"
    return true
  })

  const totalDevices = devices.length
  const onlineDevices = devices.filter((d: any) => d.status === "UP").length

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <DevicesStatsSummary devices={devices} />

        {/* Filters + view badges */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
          {/* Filter badges / dropdown */}
          <div className="flex items-center gap-2 w-full">
            {/* Large screens: badges */}
            <div className="hidden lg:flex flex-row gap-2">
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
            </div>

            {/* Small/medium screens: dropdown using Select component */}
            <div className="lg:hidden w-42">
              <Select
                value={filter}
                onValueChange={(val) => setFilter(val as "all" | "online" | "offline" | "blocked")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices ({totalDevices})</SelectItem>
                  <SelectItem value="online">Online ({onlineDevices})</SelectItem>
                  <SelectItem value="offline">Offline ({totalDevices - onlineDevices})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* View badges on the right */}
          <div className="flex flex-row gap-2">
            <Badge
              className="cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center gap-1"
              variant={view === "table" ? "default" : "outline"}
              onClick={() => setView("table")}
            >
              <Table className="w-4 h-4" /> Table
            </Badge>
            <Badge
              className="cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center gap-1"
              variant={view === "card" ? "default" : "outline"}
              onClick={() => setView("card")}
            >
              <Monitor className="w-4 h-4" /> Cards
            </Badge>
          </div>
        </section>

        {/* Device list */}
        <section className="mt-2">
          {view === "table" ? (
            filteredDevices.length > 0 ? (
              <div className="overflow-x-auto bg-background rounded-xl shadow">
                <DevicesTable devices={filteredDevices} viewType={filter} />
              </div>) : (
              <div className="text-sm text-muted-foreground text-center py-12">
                No devices found.
              </div>
            )) : (
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
