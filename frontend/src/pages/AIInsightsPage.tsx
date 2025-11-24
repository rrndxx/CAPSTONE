import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, ShieldAlert, AlertCircle } from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

type DevicePrediction = {
    mac: string;
    predictedBandwidth: number | null;
};

type Alert = {
    id: number;
    message: string;
    severity: "low" | "medium" | "high";
    timestamp: string;
};

export default function AiInsightsPage() {
    const [predictions, setPredictions] = useState<DevicePrediction[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch bandwidth predictions
                const predRes = await axios.get<Record<string, number | null>>(
                    "http://localhost:8000/predictions"
                );
                const predictionData: DevicePrediction[] = Object.entries(predRes.data).map(
                    ([mac, predicted]) => ({
                        mac,
                        predictedBandwidth: predicted,
                    })
                );
                setPredictions(predictionData);

                // Fetch alerts
                const alertRes = await axios.get<Alert[]>("http://localhost:3000/alerts/all");
                setAlerts(alertRes.data);
            } catch (err) {
                console.error("Error fetching AI data:", err);
                setError("Failed to fetch AI data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading)
        return (
            <p className="p-6 text-center text-muted-foreground">
                Loading AI insights...
            </p>
        );

    if (!predictions.length && !alerts.length)
        return (
            <p className="p-6 text-center text-muted-foreground">
                No AI insights available. {error && `(${error})`}
            </p>
        );

    const severityColor = {
        high: "bg-red-600 text-white",
        medium: "bg-yellow-500 text-black",
        low: "bg-green-600 text-white",
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">AI Network Insights</h1>
                {error && <Badge variant="destructive">{error}</Badge>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Predicted Bandwidth */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" /> Predicted Bandwidth
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {predictions.length > 0 ? (
                                predictions.map((p) => (
                                    <li
                                        key={p.mac}
                                        className="flex justify-between items-center"
                                    >
                                        <span className="font-medium">{p.mac}</span>
                                        <span className="text-muted-foreground">
                                            {p.predictedBandwidth !== null
                                                ? `${p.predictedBandwidth.toFixed(1)} MB`
                                                : "N/A"}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-muted-foreground">
                                    No device predictions available.
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                {/* High-Risk Devices */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" /> High-Risk Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {predictions.filter((p) => (p.predictedBandwidth ?? 0) > 500)
                                .length > 0 ? (
                                predictions
                                    .filter((p) => (p.predictedBandwidth ?? 0) > 500)
                                    .map((p) => (
                                        <li key={p.mac} className="flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-red-500" /> {p.mac}
                                        </li>
                                    ))
                            ) : (
                                <li>No high-risk devices detected.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <li
                                        key={alert.id}
                                        className="flex justify-between items-center"
                                    >
                                        <span>{alert.message}</span>
                                        <Badge
                                            className={`px-2 py-1 rounded ${severityColor[alert.severity]
                                                }`}
                                        >
                                            {alert.severity.toUpperCase()}
                                        </Badge>
                                    </li>
                                ))
                            ) : (
                                <li className="text-muted-foreground">No alerts detected.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
