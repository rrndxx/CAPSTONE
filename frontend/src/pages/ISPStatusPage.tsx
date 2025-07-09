import { Wifi, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

type ISPStatus = {
    provider: string
    speed: string
    status: "online" | "degraded" | "offline"
}

const getStatusBadge = (status: ISPStatus["status"]) => {
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

export function ISPStatusPage({ provider, speed, status }: ISPStatus) {
    const badge = getStatusBadge(status)

    return (
        <div className="bg-card aspect-video rounded-xl shadow p-4 flex flex-col justify-between">
            {/* Top: Icon and ISP Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wifi className="w-8 h-8 text-chart-1" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-muted-foreground">{provider}</span>
                        <span className="text-xl font-semibold text-foreground">{speed}</span>
                    </div>
                </div>
                {/* Status Badge */}
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                    {badge.icon}
                    {badge.label}
                </div>
            </div>

            {/* Bottom: Optional extra info */}
            <div className="text-xs text-muted-foreground mt-2">
                Last checked: just now
            </div>
        </div>
    )
}
