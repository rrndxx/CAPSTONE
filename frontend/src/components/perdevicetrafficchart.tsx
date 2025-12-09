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

export interface DeviceTrafficEntry {
    deviceId: number;
    deviceMac: string;
    deviceIp: string;
    last10BandwidthUsage: {
        upload: number;
        download: number;
        timestamp: string;
    }[];
}

export interface PerDeviceTrafficChartProps {
    trafficData: DeviceTrafficEntry[];
}

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

export const PerDeviceTrafficChart = ({ trafficData }: PerDeviceTrafficChartProps) => {
    const [trafficHistory, setTrafficHistory] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        if (!trafficData.length) return;

        const timestamp = new Date().toISOString();
        const newSample: Record<string, number | string> = { date: timestamp };

        trafficData.forEach((device) => {
            const lastEntry = device.last10BandwidthUsage[device.last10BandwidthUsage.length - 1];
            if (lastEntry) {
                newSample[`${device.deviceMac}-IN`] = lastEntry.download;
                newSample[`${device.deviceMac}-OUT`] = lastEntry.upload;
            }
        });

        setTrafficHistory((prev) => [...prev.slice(-59), newSample]);
    }, [trafficData]);


    const deviceKeys = useMemo(() => {
        const lastSample = trafficHistory[trafficHistory.length - 1] || {};
        return Object.keys(lastSample)
            .filter((k) => k !== "date")
            .map((k) => k.replace(/-IN|-OUT/, ""))
            .filter((v, i, a) => a.indexOf(v) === i);
    }, [trafficHistory]);

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

    const renderChart = (data: typeof trafficHistory, config: ChartConfig, title: string, description: string) => (
        <Card className="pt-4 flex-1">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 border-b py-4 px-4 sm:px-6 bg-primary">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-black">{description}</CardDescription>
                </div>
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
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleTimeString();
                                }}
                            />
                            <YAxis tickFormatter={(val) => formatBytes(Number(val))} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent formatter={(val) => formatBytes(Number(val))} indicator="dot" />}
                            />
                            {Object.keys(config).map((key) => (
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
