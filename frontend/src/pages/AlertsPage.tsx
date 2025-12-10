import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import { ShieldAlert, WifiOff, LogIn } from "lucide-react"

type AlertEntry = {
    id: string
    time: string
    type: "Login-Related" | "Device-Connected" | "Security-Connected"
    message: string
    severity: "Low" | "Medium" | "High"
}

// Icons for alert types
const alertIcons: Record<AlertEntry["type"], any> = {
    "Login-Related": <LogIn className="text-blue-500" size={20} />,
    "Device-Connected": <WifiOff className="text-yellow-500" size={20} />,
    "Security-Connected": <ShieldAlert className="text-red-500" size={20} />,
}

// Severity colors
const severityColors: Record<AlertEntry["severity"], string> = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-700",
}

// Filter buttons
const filterButtons: ("All" | AlertEntry["type"])[] = [
    "All",
    "Login-Related",
    "Device-Connected",
    "Security-Connected",
]

// Map database types to frontend types
const mapAlertType = (dbType: string): AlertEntry["type"] => {
    switch (dbType) {
        case "LOGIN":
            return "Login-Related"
        case "CONNECTED_DEVICES_RELATED":
            return "Device-Connected"
        default:
            return "Security-Connected"
    }
}

// Map severity
const mapAlertSeverity = (dbSeverity: string): AlertEntry["severity"] => {
    switch (dbSeverity) {
        case "CRITICAL":
            return "High"
        case "WARNING":
            return "Medium"
        default:
            return "Low"
    }
}

const Alerts = () => {
    const [alerts, setAlerts] = useState<AlertEntry[]>([])
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<"All" | AlertEntry["type"]>("All")

    // Fetch alerts
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get("http://localhost:4000/alerts/all")
                const mapped: AlertEntry[] = res.data.alerts.map((a: any) => ({
                    id: a.alertId?.toString() ?? crypto.randomUUID(),
                    time: a.time ? new Date(a.time).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                    }) : "Unknown",
                    message: a.message ?? "No message",
                    type: mapAlertType(a.type),
                    severity: mapAlertSeverity(a.severity),
                }))
                setAlerts(mapped)
            } catch (err) {
                console.error("Failed to fetch alerts:", err)
            }
        }
        fetchAlerts()
    }, [])

    // Filter + search
    const filteredAlerts = alerts.filter(alert => {
        if (filterType !== "All" && alert.type !== filterType) return false

        const searchLower = search.toLowerCase()
        if (!searchLower) return true

        return [alert.message, alert.type, alert.severity].some(field =>
            field.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-8 gap-2">
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

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {filteredAlerts.length > 0 ? (
                            filteredAlerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    <div className="mt-1">{alertIcons[alert.type]}</div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h2 className="font-semibold text-base">{alert.message}</h2>
                                            <Badge className={severityColors[alert.severity]}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                                            <span className="font-medium">{alert.type}</span>
                                            <span>•</span>
                                            <span>{alert.time}</span>
                                        </div>
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
