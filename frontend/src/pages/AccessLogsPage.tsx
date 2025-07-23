import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState } from "react"

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

const AccessLogs = () => {
    const [search, setSearch] = useState("")

    const filteredLogs = sampleLogs.filter((log) =>
        Object.values(log).some((value) =>
            value.toString().toLowerCase().includes(search.toLowerCase())
        )
    )

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-semibold mb-4">Audit Trail / Access Logs</h1>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <Input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                                    <TableHead className="whitespace-nowrap">User</TableHead>
                                    <TableHead className="whitespace-nowrap">Action</TableHead>
                                    <TableHead className="whitespace-nowrap">Target</TableHead>
                                    <TableHead className="whitespace-nowrap">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.timestamp}</TableCell>
                                            <TableCell>{log.user}</TableCell>
                                            <TableCell className="font-semibold text-blue-600">
                                                {log.action}
                                            </TableCell>
                                            <TableCell>{log.target}</TableCell>
                                            <TableCell>{log.details}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500">
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccessLogs
