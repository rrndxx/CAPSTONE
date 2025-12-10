import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Server } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type PredictionPoint = { timestamp: string; predicted: number };
type DevicePrediction = { mac: string; predictions: PredictionPoint[] };

export default function AiInsightsPage() {
    const [data, setData] = useState<DevicePrediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trafficStats, setTrafficStats] = useState<{ peakHour: string; totalBandwidth: number } | null>(null);

    const fetchPredictions = async () => {
        try {
            const [predRes, statsRes] = await Promise.all([
                axios.get("http://localhost:4000/predictions"),
                axios.get<{ peakHour: string; totalBandwidth: number }>("http://localhost:4000/traffic-stats"),
            ]);

            const predsObj = predRes.data.predictions || {};

            const predictionData: DevicePrediction[] = Object.entries(predsObj).map(([mac, preds]) => ({
                mac,
                predictions: Array.isArray(preds) ? preds.map(p => ({
                    timestamp: new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
                    predicted: p.predicted / 1024 / 1024, // bytes → MB
                })) : [],
            }));

            setData(predictionData);
            setTrafficStats({
                peakHour: predRes.data.peakHour,
                totalBandwidth: predRes.data.totalExpectedBandwidth / 1024 / 1024, // convert to MB if needed
            });

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
    if (!data.length) return <p className="p-6 text-center text-muted-foreground">No AI insights available. {error && `(${error})`}</p>;

    // Total predicted bandwidth across all devices
    const totalPredictedBandwidthMB = data.reduce(
        (sum, d) => sum + d.predictions.reduce((s, p) => s + p.predicted, 0),
        0
    );

    // Find the timestamp where total bandwidth is maximum
    const totalPerTimestamp: { timestamp: string; total: number }[] = [];
    if (data.length > 0) {
        const timestamps = data[0].predictions.map(p => p.timestamp);
        timestamps.forEach((t, idx) => {
            const totalAtTime = data.reduce((sum, d) => sum + (d.predictions[idx]?.predicted ?? 0), 0);
            totalPerTimestamp.push({ timestamp: t, total: totalAtTime });
        });
    }
    const peakTotal = totalPerTimestamp.reduce(
        (prev, curr) => (curr.total > prev.total ? curr : prev),
        { timestamp: "-", total: 0 }
    );

    // Prepare chart data: total predicted bandwidth per timestamp
    const chartData = totalPerTimestamp.map(tp => ({ timestamp: tp.timestamp, totalPredicted: tp.total }));

    // Format peak hour into 12-hour time
    const formattedPeakHour = trafficStats?.peakHour
        ? new Date(`1970-01-01T${trafficStats.peakHour}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : "-";

    // Format bandwidth in MB / KB
    const formatBandwidth = (valMB: number) => {
        if (valMB >= 1) return `${valMB.toFixed(1)} MB`;
        return `${(valMB * 1024).toFixed(0)} KB`;
    };

    return (
        <div className="p-6 space-y-6">
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
                            <Clock className="w-5 h-5 text-yellow-500" /> Expected Peak Hour
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formattedPeakHour}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" /> Total Predicted Bandwidth
                            </div>
                            <span className="text-sm text-muted-foreground">
                                Peak at: {peakTotal.timestamp}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatBandwidth(totalPredictedBandwidthMB)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Trend Chart */}
            <Card>
                <CardHeader className="bg-primary py-4">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Predicted Total Bandwidth Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="timestamp" />
                            <YAxis label={{ value: "MB", angle: -90, position: "insideLeft" }} />
                            <Tooltip
                                formatter={(value: number) => formatBandwidth(value)}
                                labelFormatter={(label: string) => `Time: ${label}`}
                            />
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
                <CardHeader className="bg-primary py-4">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Devices Predicted Bandwidth
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border text-left">MAC Address</th>
                                    <th className="p-2 border text-right">Max Predicted</th>
                                    <th className="p-2 border text-right">Total Predicted</th>
                                    <th className="p-2 border text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d, idx) => {
                                    const maxPredPoint = d.predictions.reduce(
                                        (prev, curr) => (curr.predicted > prev.predicted ? curr : prev),
                                        { timestamp: "-", predicted: 0 }
                                    );
                                    const totalPred = d.predictions.reduce((s, p) => s + p.predicted, 0);
                                    return (
                                        <tr key={d.mac} className="hover:bg-gray-50">
                                            <td className="p-2 border text-center">{idx + 1}</td>
                                            <td className="p-2 border font-mono">{d.mac}</td>
                                            <td className="p-2 border text-right">{formatBandwidth(maxPredPoint.predicted)}</td>
                                            <td className="p-2 border text-right">{formatBandwidth(totalPred)}</td>
                                            <td className="p-2 border text-right">{maxPredPoint.timestamp}</td>
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
