import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ShieldAlert, User, Clock, Target, Info } from "lucide-react"

type LogEntry = {
    id: number
    timestamp: string
    user: string
    action: string
    target: string
    details: string
}

const sampleLogs: LogEntry[] = [
    {
        id: 1,
        timestamp: "2025-07-23 10:21:00",
        user: "admin",
        action: "Blocked Device",
        target: "MAC: 00:1A:2B:3C:4D:5E",
        details: "Manual block issued from Dashboard",
    },
    {
        id: 2,
        timestamp: "2025-07-23 09:12:33",
        user: "system",
        action: "Alert Triggered",
        target: "Device: IoT-Camera",
        details: "Abnormal traffic pattern detected",
    },
    {
        id: 3,
        timestamp: "2025-07-22 18:44:10",
        user: "admin",
        action: "Unblocked Device",
        target: "MAC: BC:AE:C5:33:22:11",
        details: "Device re-approved after review",
    },
]

const getColor = (action: string) => {
    if (action.includes("Blocked")) return "text-red-600"
    if (action.includes("Unblocked")) return "text-green-600"
    if (action.includes("Alert")) return "text-yellow-600"
    return "text-blue-600"
}

const AccessLogsPage = () => {
    const [search, setSearch] = useState("")

    const logs = sampleLogs
    const filteredLogs = Array.isArray(logs)
        ? logs.filter((log) =>
            Object.values(log).some((value) =>
                value.toString().toLowerCase().includes(search.toLowerCase())
            )
        )
        : []

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex justify-end">
                <Input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md"
                />
            </div>

            {filteredLogs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredLogs.map((log) => (
                        <Card
                            key={log.id}
                            className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition duration-150"
                        >
                            <CardContent className="p-4 space-y-3 text-sm">
                                <div className="flex justify-between text-gray-500 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{log.timestamp}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{log.user}</span>
                                    </div>
                                </div>

                                <div className={`font-semibold flex items-center gap-2 ${getColor(log.action)}`}>
                                    <ShieldAlert className="w-5 h-5" />
                                    <span>{log.action}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <Target className="w-4 h-4 text-gray-500" />
                                    <span>{log.target}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <Info className="w-4 h-4 text-gray-500" />
                                    <span className="line-clamp-2">{log.details}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-6">No logs found.</p>
            )}
        </div>
    )
}

export default AccessLogsPage
