import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, ShieldAlert, Server } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type PredictionPoint = { timestamp: string; predicted: number };
type DevicePrediction = { mac: string; predictions: PredictionPoint[] };

export default function AiInsightsPage() {
    const [data, setData] = useState<DevicePrediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trafficStats, setTrafficStats] = useState<{ peakHour: number; totalBandwidth: number } | null>(null);

    const fetchPredictions = async () => {
        try {
            const [predRes, statsRes] = await Promise.all([
                axios.get<Record<string, PredictionPoint[]>>("http://localhost:4000/predictions"),
                axios.get<{ peakHour: number; totalBandwidth: number }>("http://localhost:4000/traffic-stats"),
            ]);

            const predictionData: DevicePrediction[] = Object.entries(predRes.data).map(([mac, preds]) => ({
                mac,
                predictions: preds.map(p => ({
                    timestamp: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    predicted: p.predicted / 1024 / 1024, // convert bytes to MB
                })),
            }));

            setData(predictionData);
            setTrafficStats(statsRes.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch AI predictions or traffic stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
        const interval = setInterval(fetchPredictions, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <p className="p-6 text-center text-muted-foreground">Loading AI insights...</p>;
    if (!data.length)
        return <p className="p-6 text-center text-muted-foreground">No AI insights available. {error && `(${error})`}</p>;

    const HIGH_RISK_THRESHOLD_MB = 10; // Adjusted threshold in MB
    const highRiskDevices = data.filter(d => d.predictions.some(p => p.predicted > HIGH_RISK_THRESHOLD_MB));

    const totalPredictedBandwidth = data.reduce(
        (sum, d) => sum + d.predictions.reduce((s, p) => s + p.predicted, 0),
        0
    );

    // Prepare chart data: total predicted bandwidth per timestamp
    const chartData: { timestamp: string; totalPredicted: number }[] = [];
    if (data.length > 0) {
        const timestamps = data[0].predictions.map(p => p.timestamp);
        timestamps.forEach((t, idx) => {
            const totalAtTime = data.reduce((sum, d) => sum + (d.predictions[idx]?.predicted ?? 0), 0);
            chartData.push({ timestamp: t, totalPredicted: totalAtTime });
        });
    }

    // Format peak hour nicely
    const formattedPeakHour = trafficStats
        ? new Date().setHours(trafficStats.peakHour, 0, 0)
        : null;

    const peakHourString = formattedPeakHour
        ? new Date(formattedPeakHour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-";

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold">AI Network Insights</h1>
                {error && <Badge variant="destructive">{error}</Badge>}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-500" /> Total Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{data.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500" /> High-Risk Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{highRiskDevices.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" /> Total Predicted Bandwidth
                            </div>
                            {trafficStats && (
                                <span className="text-sm text-muted-foreground">
                                    Expected Peak Hour Today: {peakHourString}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalPredictedBandwidth.toFixed(1)} MB</p>
                    </CardContent>
                </Card>
            </div>

            {/* Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Predicted Total Bandwidth Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis label={{ value: "MB", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="totalPredicted"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                name="Total Predicted Bandwidth"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Devices Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" /> Devices Predicted Bandwidth
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border text-left">MAC Address</th>
                                    <th className="p-2 border text-right">Max Predicted Bandwidth (MB)</th>
                                    <th className="p-2 border text-right">Total Predicted Bandwidth (MB)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d, idx) => {
                                    const maxPred = Math.max(...d.predictions.map(p => p.predicted));
                                    const totalPred = d.predictions.reduce((s, p) => s + p.predicted, 0);
                                    return (
                                        <tr key={d.mac} className="hover:bg-gray-50">
                                            <td className="p-2 border text-center">{idx + 1}</td>
                                            <td className="p-2 border">{d.mac}</td>
                                            <td className="p-2 border text-right">{maxPred.toFixed(1)}</td>
                                            <td className="p-2 border text-right">{totalPred.toFixed(1)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
