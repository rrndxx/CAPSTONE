import { ChartArea } from "@/components/areachart"
import { Gauge } from "@/components/gauge";
import { DevicesTable } from "@/components/devicestable";
import { SidebarInset } from "@/components/ui/sidebar"
import { Wifi, Smartphone, AlertCircle, BrainCircuit } from "lucide-react"
import { devices } from "@/constants/constants";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function MainDashboardPage() {
    const uptime = {
        days: 1,
        hours: 3,
    }
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
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-4 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    icon: <Smartphone className="w-8 h-8 text-chart-1" />,
                                    label: "Connected Devices",
                                    value: "128",
                                },
                                {
                                    icon: <Wifi className="w-8 h-8 text-chart-1" />,
                                    label: "Uptime Monitor",
                                    value: `${uptime.days}d ${uptime.hours}h`,
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
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                        {Array.isArray(devices) && devices.length > 0 ? (
                            <DevicesTable devices={filteredDevices} viewType="all" />
                        ) : (
                            <div>No devices found.</div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
