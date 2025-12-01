import { ChartArea } from "@/components/areachart"
import { Gauge } from "@/components/gauge"
import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { Wifi, Smartphone, BrainCircuit, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useDevices } from "@/hooks/useDevices"
import { useSystemTime } from "@/hooks/useOPNSense"

function formatUptime(uptimeStr?: string) {
    if (!uptimeStr) return "—"
    const [h, m, s] = uptimeStr.split(":").map(Number)
    const totalSeconds = h * 3600 + m * 60 + s
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

export default function MainDashboardPage() {
    const { data: devices = [] } = useDevices(2)
    const { data: systemTime, isLoading } = useSystemTime()
    const [uptime, setUptime] = useState("")

    useEffect(() => {
        setUptime(formatUptime(systemTime?.uptime))
    }, [systemTime])

    const [filter, setFilter] = useState<"all" | "online" | "offline" | "blocked">("all")

    const filteredDevices = devices.filter((d: { status: string; trustStatus: string }) => {
        if (filter === "online") return d.status === "UP"
        if (filter === "offline") return d.status === "DOWN"
        if (filter === "blocked") return d.trustStatus === "BLACKLISTED"
        return true
    })

    const totalDevices = devices.length
    const onlineDevices = devices.filter((d: { status: string }) => d.status === "UP").length
    const blockedDevices = devices.filter((d: { trustStatus: string }) => d.trustStatus === "BLACKLISTED").length

    if (isLoading) {
        return <div className="h-full w-full flex flex-col justify-center items-center gap-4"><Loader2 className="h-16 w-16 animate-spin" /><p className="text-lg ">LOADING SYSTEM</p></div>
    }

    if (!systemTime) return <p className="p-4">No data available</p>

    return (
        <SidebarInset>
            <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-x-hidden h-full w-full">
                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {[
                            { icon: <Smartphone className="w-8 h-8 text-chart-1" />, label: "Devices", value: devices.length },
                            { icon: <Wifi className="w-8 h-8 text-chart-1" />, label: "Uptime", value: uptime },
                            { icon: <BrainCircuit className="w-8 h-8 text-chart-1" />, label: "AI Insights", value: "6" },
                        ].map((card, i) => (
                            <div key={i} className="w-full bg-card rounded-2xl shadow p-6 flex items-center gap-4 min-h-[120px]">
                                <div className="flex-shrink-0">{card.icon}</div>
                                <div className="flex flex-col">
                                    <p className="text-xl font-semibold">{card.value}</p>
                                    <p className="text-sm text-muted-foreground">{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="rounded-xl mt-4 min-w-0">
                        <ChartArea />
                    </div>
                </div>

                {/* Right Column: Gauge */}
                <div className="w-full lg:w-auto bg-background rounded-xl shadow flex justify-center min-w-0">
                    <Gauge className="max-w-full" />
                </div>
            </div>

            {/* Devices Filter & Table */}
            <div className="p-4 md:p-6 min-w-0">
                <div className="flex flex-wrap gap-2 mb-4">
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

                <div className="overflow-x-auto bg-background rounded-xl shadow">
                    {filteredDevices.length > 0 ? (
                        <DevicesTable devices={filteredDevices} viewType={filter} />
                    ) : (
                        <div className="text-sm text-primary text-center py-12">
                            No devices found.
                        </div>
                    )}

                </div>
            </div>
        </SidebarInset>
    )
}
