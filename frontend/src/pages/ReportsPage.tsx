import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ReportsPage() {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-4">Network Reports</h1>
            <Separator className="mb-6" />

            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>

                {/* Daily Reports */}
                <TabsContent value="daily">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Total Devices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">58</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Blocked Devices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">12</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Alerts Triggered</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">6</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Today's Report</h2>
                        <Button className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                    </div>

                    <Card className="w-full">
                        <CardContent className="overflow-x-auto p-4">
                            <table className="min-w-full text-sm">
                                <thead className="text-left border-b">
                                    <tr>
                                        <th className="py-2 pr-4">Time</th>
                                        <th className="py-2 pr-4">Device</th>
                                        <th className="py-2 pr-4">Activity</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { time: "08:00 AM", device: "Laptop-CRMC-01", activity: "Connected", status: "Allowed" },
                                        { time: "08:15 AM", device: "Phone-CRMC-02", activity: "Exceeded Bandwidth", status: "Blocked" },
                                        { time: "08:45 AM", device: "Tablet-CRMC-04", activity: "Unusual Activity", status: "Alerted" },
                                    ].map((log, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2 pr-4">{log.time}</td>
                                            <td className="py-2 pr-4">{log.device}</td>
                                            <td className="py-2 pr-4">{log.activity}</td>
                                            <td className="py-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${log.status === "Blocked"
                                                        ? "bg-red-200 text-red-700"
                                                        : log.status === "Alerted"
                                                            ? "bg-yellow-200 text-yellow-800"
                                                            : "bg-green-200 text-green-700"
                                                        }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Weekly and Monthly can be implemented similarly */}
                <TabsContent value="weekly">
                    <p className="text-muted-foreground text-sm">Weekly report summary will appear here.</p>
                </TabsContent>
                <TabsContent value="monthly">
                    <p className="text-muted-foreground text-sm">Monthly report summary will appear here.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}
