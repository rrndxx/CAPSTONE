import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingUp, Clock, ShieldAlert } from "lucide-react"
import axios from "axios"
import { Badge } from "@/components/ui/badge"

type InsightData = {
    topTalkers: { hostname: string; mac: string; usage: number }[]
    alerts: { id: number; message: string; severity: string; timestamp: string }[]
    predictions: {
        congestedHours: string[]
        highRiskDevices: string[]
    }
}

export default function AiInsightsPage() {
    const [data, setData] = useState<InsightData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const sample: InsightData = {
        topTalkers: [
            { hostname: "AdminPC", mac: "00:11:22:33:44", usage: 420.5 },
            { hostname: "Mobile1", mac: "A1:B2:C3:D4", usage: 350.2 },
        ],
        alerts: [
            {
                id: 1,
                message: "Unusual download spike on 192.168.1.23",
                severity: "high",
                timestamp: "2025-07-23 13:40",
            },
            {
                id: 2,
                message: "Device tried accessing restricted port",
                severity: "medium",
                timestamp: "2025-07-23 13:20",
            },
        ],
        predictions: {
            congestedHours: ["12:00–14:00", "18:00–20:00"],
            highRiskDevices: ["00:11:22:33:44", "A1:B2:C3:D4"],
        },
    }

    useEffect(() => {
        axios
            .get("/api/ai-insights")
            .then((res) => setData(res.data))
            .catch(() => {
                setData(sample)
                setError("Live data unavailable. Showing sample.")
            })
    }, [])

    if (!data) return <p className="p-4">Loading insights...</p>

    const severityColor = {
        high: "bg-red-500",
        medium: "bg-yellow-500",
        low: "bg-green-500",
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">AI Network Insights</h1>
                {error && <Badge variant="destructive">Sample Data Mode</Badge>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Top Talkers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Top Talkers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {sample.topTalkers.map((dev, i) => (
                                <li key={i}>
                                    <span className="font-semibold">{dev.hostname}</span>{" "}
                                    ({dev.mac}) –{" "}
                                    <span className="text-muted-foreground">{dev.usage.toFixed(1)} MB</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Predicted Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm">
                            {sample.alerts.map((alert) => (
                                <li key={alert.id} className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{alert.message}</span>
                                        <Badge
                                            className={`text-white ${severityColor[alert.severity as keyof typeof severityColor]
                                                }`}
                                        >
                                            {alert.severity}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{alert.timestamp}</div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card >

                {/* Predictions */}
                <Card >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            Predictions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div>
                            <strong>Congested Hours:</strong>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {sample.predictions.congestedHours.map((time, i) => (
                                    <li key={i}>{time}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <strong>High Risk Devices:</strong>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {sample.predictions.highRiskDevices.map((mac, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-red-500" />
                                        {mac}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card >
            </div >
        </div >
    )
}
