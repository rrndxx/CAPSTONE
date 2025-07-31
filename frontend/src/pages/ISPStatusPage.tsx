import {
    Wifi,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    GaugeCircle,
    Router,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatusType = "online" | "degraded" | "offline"

const status: StatusType = "online"

const getStatusBadge = (status: StatusType) => {
    switch (status) {
        case "online":
            return {
                label: "Online",
                color: "bg-green-100 text-green-700",
                icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
            }
        case "degraded":
            return {
                label: "Degraded",
                color: "bg-yellow-100 text-yellow-800",
                icon: <AlertTriangle className="w-4 h-4 mr-1" />,
            }
        case "offline":
            return {
                label: "Offline",
                color: "bg-red-100 text-red-700",
                icon: <XCircle className="w-4 h-4 mr-1" />,
            }
        default:
            return {
                label: "Unknown",
                color: "bg-gray-100 text-gray-600",
                icon: null,
            }
    }
}

export default function ISPStatusPage() {
    const badge = getStatusBadge(status)

    return (
        <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
            {/* ISP Overview */}
            <Card className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                        <Wifi className="w-5 h-5 text-chart-1" />
                        ISP Connection
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between flex-1 gap-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Provider</p>
                            <p className="text-lg font-semibold text-foreground">SkyNet Fiber</p>
                        </div>
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.icon}
                            {badge.label}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Plan Speed</p>
                        <p className="text-xl font-bold text-foreground">300 Mbps</p>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">Last checked: just now</p>
                </CardContent>
            </Card>

            {/* Speed Test */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                        <GaugeCircle className="w-5 h-5 text-chart-1" />
                        Speed Test
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Download</p>
                        <p className="text-lg font-semibold text-foreground">275.5 Mbps</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Upload</p>
                        <p className="text-lg font-semibold text-foreground">92.1 Mbps</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ping</p>
                        <p className="text-lg font-semibold text-foreground">18 ms</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Jitter</p>
                        <p className="text-lg font-semibold text-foreground">2.3 ms</p>
                    </div>
                </CardContent>
            </Card>

            {/* Router Info */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                        <Router className="w-5 h-5 text-chart-1" />
                        Router Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="text-base font-medium text-foreground">TP-Link Archer AX50</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">IP Address</p>
                        <p className="text-base font-medium text-foreground">192.168.1.1</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">MAC Address</p>
                        <p className="text-base font-medium text-foreground">A4:5E:60:2C:FF:10</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Firmware Version</p>
                        <p className="text-base font-medium text-foreground">1.2.5 Build 2024</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                        <p className="text-base font-medium text-foreground">4d 18h 23m</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Gateway</p>
                        <p className="text-base font-medium text-foreground">192.168.1.254</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
