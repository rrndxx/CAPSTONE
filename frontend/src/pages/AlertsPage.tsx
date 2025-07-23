import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Bell, AlertCircle, ShieldAlert, WifiOff } from "lucide-react"

type AlertEntry = {
    id: number
    timestamp: string
    type: "Security" | "Connectivity" | "System"
    message: string
    severity: "Low" | "Medium" | "High"
}

const alertIcons = {
    Security: <ShieldAlert className="text-red-500" size={20} />,
    Connectivity: <WifiOff className="text-yellow-500" size={20} />,
    System: <AlertCircle className="text-blue-500" size={20} />,
}

const severityColors: Record<string, string> = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-700",
}

const alertsSample: AlertEntry[] = [
    {
        id: 1,
        timestamp: "2025-07-23 10:22:00",
        type: "Security",
        message: "Unauthorized device attempted to connect.",
        severity: "High",
    },
    {
        id: 2,
        timestamp: "2025-07-23 09:58:44",
        type: "Connectivity",
        message: "Network latency exceeded threshold.",
        severity: "Medium",
    },
    {
        id: 3,
        timestamp: "2025-07-22 16:35:12",
        type: "System",
        message: "Scheduled system scan completed.",
        severity: "Low",
    },
    {
        id: 4,
        timestamp: "2025-07-22 15:20:05",
        type: "Security",
        message: "MAC address blacklisted.",
        severity: "High",
    },
]

const Alerts = () => {
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<"All" | "Security" | "Connectivity" | "System">("All")

    const filteredAlerts = alertsSample.filter(alert =>
        (filterType === "All" || alert.type === filterType) &&
        Object.values(alert).some(value =>
            value.toString().toLowerCase().includes(search.toLowerCase())
        )
    )

    const filterButtons: ("All" | "Security" | "Connectivity" | "System")[] = [
        "All", "Security", "Connectivity", "System"
    ]

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Bell className="text-primary" />
                <h1 className="text-2xl font-semibold">Alerts & Notifications</h1>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <Input
                            type="text"
                            placeholder="Search alerts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {filterButtons.map(type => (
                                <Button
                                    key={type}
                                    variant={filterType === type ? "default" : "outline"}
                                    onClick={() => setFilterType(type)}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                        {filteredAlerts.length > 0 ? (
                            filteredAlerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted transition dark:hover:bg-gray-800"
                                >
                                    <div className="mt-1">{alertIcons[alert.type]}</div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h2 className="font-semibold text-base">{alert.message}</h2>
                                            <Badge className={severityColors[alert.severity]}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {alert.type} • {alert.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                No alerts found.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Alerts
