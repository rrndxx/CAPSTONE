import { ChartArea } from "@/components/areachart"
import { Gauge } from "@/components/gauge";
import { DevicesTable } from "@/components/devicestable";
import { SidebarInset } from "@/components/ui/sidebar"
import { Wifi, Smartphone, AlertCircle, BrainCircuit } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useDevices } from "@/hooks/useDevices";
import { useSystemTime } from "@/hooks/useOPNSense";

function formatUptime(uptimeStr?: string) {
    if (!uptimeStr) return "—"
    const [h, m, s] = uptimeStr.split(":").map(Number)

    const totalSeconds = h * 3600 + m * 60 + s
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (days > 0) {
        return `${days}d ${hours}h`
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
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

    const filteredDevices = devices.filter((d: { status: string; authorized: any }) => {
        if (filter === "online") return d.status === "UP"
        if (filter === "offline") return d.status === "DOWN"
        if (filter === "blocked") return !d.authorized
        return true
    })

    const totalDevices = devices.length
    const onlineDevices = devices.filter((d: { status: string }) => d.status === "UP").length
    const blockedDevices = devices.filter((d: { authorized: any }) => !d.authorized).length

    if (isLoading) return <p>Loading system status...</p>
    if (!systemTime) return <p>No data available</p>

    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-4 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    icon: <Smartphone className="w-8 h-8 text-chart-1" />,
                                    label: "Devices",
                                    value: devices.length,
                                },
                                {
                                    icon: <Wifi className="w-8 h-8 text-chart-1" />,
                                    label: "Uptime",
                                    value: uptime,
                                },
                                {
                                    icon: <AlertCircle className="w-8 h-8 text-chart-1" />,
                                    label: "Critical Alerts",
                                    value: "3",
                                },
                                {
                                    icon: <BrainCircuit className="w-8 h-8 text-chart-1" />,
                                    label: "AI Insights",
                                    value: "6",
                                },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className="bg-card rounded-2xl shadow p-6 px-6 flex items-center gap-4 min-h-[115px]"
                                >
                                    <div className="flex-shrink-0">{card.icon}</div>
                                    <div className="flex flex-col">
                                        <p className="text-xl font-semibold">{card.value}</p>
                                        <p className="text-sm text-muted-foreground">{card.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px]">
                            <ChartArea />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px]">
                        <Gauge />
                    </div>
                </div>
                <div className="mt-2">
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
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4">
                        {Array.isArray(devices) && filteredDevices.length > 0 ? (
                            <DevicesTable devices={filteredDevices} viewType="all" />
                        ) : (
                            <div className="text-muted-foreground text-sm text-center py-8">
                                No devices match the filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
