"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import type { DeviceTrafficSample } from "@/hooks/usePerDeviceTraffic";

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
}

interface Props {
    data: DeviceTrafficSample[];
}

const generateChartConfig = (keys: string[]): ChartConfig =>
    keys.reduce((acc, key, i) => {
        acc[key] = { label: key.replace(/-IN|-OUT/, ""), color: `hsl(${(i * 70) % 360}, 70%, 50%)` };
        return acc;
    }, {} as ChartConfig);

export function PerDeviceTrafficChart({ data }: Props) {
    const deviceKeys = React.useMemo(() => {
        const lastSample = data[data.length - 1] || {};
        return Object.keys(lastSample).filter(k => k !== "date");
    }, [data]);

    const chartConfig = generateChartConfig(deviceKeys);

    return (
        <Card className="pt-4 flex-1">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 border-b py-4 px-4 sm:px-6">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">Per-Device Traffic</CardTitle>
                    <CardDescription>Bits per device per second.</CardDescription>
                </div>
                {data.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                        {Object.keys(chartConfig).map((key, i) => (
                            <span key={key}>
                                {chartConfig[key].label}: {formatBytes(Number(data[data.length - 1][key] ?? 0))}
                                {i < Object.keys(chartConfig).length - 1 ? " | " : ""}
                            </span>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 pt-4">
                <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfig} className="min-w-[300px] sm:min-w-0 w-full h-[300px]">
                        <AreaChart data={data}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(val) => new Date(val as string).toLocaleTimeString()}
                            />
                            <YAxis tickFormatter={(val) => formatBytes(Number(val))} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(val) => formatBytes(Number(val))} indicator="dot" />} />
                            {Object.keys(chartConfig).map((key) => (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    type="monotone"
                                    stroke={chartConfig[key].color}
                                    fillOpacity={0.15}
                                    fill={chartConfig[key].color}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            ))}
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}