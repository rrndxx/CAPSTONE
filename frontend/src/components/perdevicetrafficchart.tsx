"use client";

import { useState, useEffect, useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { usePerDeviceTraffic, type DeviceTrafficSample } from "@/hooks/usePerDeviceTraffic";

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

export const PerDeviceTrafficChart = () => {
    const [trafficHistory, setTrafficHistory] = useState<DeviceTrafficSample[]>([]);
    const latestSample = usePerDeviceTraffic();

    // Append latest sample to history, keep last 60 seconds
    useEffect(() => {
        if (latestSample) {
            setTrafficHistory(prev => [...prev.slice(-59), latestSample]);
        }
    }, [latestSample]);

    // Compute unique device keys
    const deviceKeys = useMemo(() => {
        const lastSample = trafficHistory[trafficHistory.length - 1] || {};
        return Object.keys(lastSample)
            .filter(key => key !== "date")
            .map(k => k.replace(/-IN|-OUT/, ""))
            .filter((v, i, a) => a.indexOf(v) === i);
    }, [trafficHistory]);

    // Chart configs
    const chartConfigIn: ChartConfig = useMemo(() => {
        return deviceKeys.reduce((acc, key, i) => {
            acc[`${key}-IN`] = { label: key, color: `hsl(${(i * 70) % 360}, 70%, 50%)` };
            return acc;
        }, {} as ChartConfig);
    }, [deviceKeys]);

    const chartConfigOut: ChartConfig = useMemo(() => {
        return deviceKeys.reduce((acc, key, i) => {
            acc[`${key}-OUT`] = { label: key, color: `hsl(${(i * 70) % 360}, 70%, 50%)` };
            return acc;
        }, {} as ChartConfig);
    }, [deviceKeys]);

    // Function to render chart
    const renderChart = (data: DeviceTrafficSample[], config: ChartConfig, title: string, description: string) => (
        <Card className="pt-4 flex-1">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 border-b py-4 px-4 sm:px-6 bg-primary">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-black">{description}</CardDescription>
                </div>
                {data.length > 0 && (
                    <div className="text-sm">
                        {Object.keys(config).map((key, i) => (
                            <span key={key}>
                                {config[key].label}: {formatBytes(Number(data[data.length - 1][key] ?? 0))}
                                {i < Object.keys(config).length - 1 ? " | " : ""}
                            </span>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 pt-4">
                <div className="w-full overflow-x-auto">
                    <ChartContainer config={config} className="min-w-[300px] sm:min-w-0 w-full h-[300px]">
                        <LineChart data={data}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value: string | number) => {
                                    const date = typeof value === "string" ? new Date(value) : new Date(value);
                                    return date.toLocaleTimeString();
                                }}
                            />
                            <YAxis tickFormatter={(val) => formatBytes(Number(val))} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent formatter={(val) => formatBytes(Number(val))} indicator="dot" />}
                            />
                            {Object.keys(config).map(key => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={config[key].color}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            ))}
                            <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-row gap-6 bg-background">
            {renderChart(trafficHistory, chartConfigIn, "Inbound Traffic", "Inbound bits per device.")}
            {renderChart(trafficHistory, chartConfigOut, "Outbound Traffic", "Outbound bits per device.")}
        </div>
    );
};
