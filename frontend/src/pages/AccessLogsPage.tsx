import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Laptop, MapPin, Clock, User, Shield } from "lucide-react"

type AccessLogEntry = {
    id: number
    timestamp: string
    deviceName: string
    ip: string
    mac: string
    location: string
    status: "allowed" | "blocked"
}

const sampleLogs: AccessLogEntry[] = [
    {
        id: 1,
        timestamp: "2025-07-23 12:30",
        deviceName: "Admin-PC",
        ip: "192.168.1.10",
        mac: "00:11:22:33:44:55",
        location: "New York, USA",
        status: "allowed",
    },
    {
        id: 2,
        timestamp: "2025-07-23 12:32",
        deviceName: "Mobile-John",
        ip: "192.168.1.20",
        mac: "66:77:88:99:AA:BB",
        location: "Los Angeles, USA",
        status: "blocked",
    },
    {
        id: 3,
        timestamp: "2025-07-22 18:44",
        deviceName: "Tablet-Mary",
        ip: "192.168.1.30",
        mac: "CC:DD:EE:FF:00:11",
        location: "Chicago, USA",
        status: "allowed",
    },
]

const statusColors: Record<"allowed" | "blocked", string> = {
    allowed: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
}

const filterOptions = ["All", "allowed", "blocked"] as const
type FilterType = typeof filterOptions[number]

const AccessLogsPage = () => {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<FilterType>("All")

    const filteredLogs = sampleLogs.filter(log =>
        (filter === "All" || log.status === filter) &&
        Object.values(log).some(value =>
            value.toString().toLowerCase().includes(search.toLowerCase())
        )
    )

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Shield className="text-primary" />
                <h1 className="text-2xl font-semibold">Access Logs</h1>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <Input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {filterOptions.map(option => (
                                <Button
                                    key={option}
                                    variant={filter === option ? "default" : "outline"}
                                    onClick={() => setFilter(option)}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map(log => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted transition dark:hover:bg-gray-800"
                                >
                                    <Laptop className="text-blue-500 mt-1" size={20} />
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h2 className="font-semibold text-base">{log.deviceName}</h2>
                                            <Badge className={statusColors[log.status]}>
                                                {log.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> {log.timestamp}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            <User className="w-4 h-4" /> MAC: {log.mac}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {log.location}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            IP: {log.ip}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No logs found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccessLogsPage
