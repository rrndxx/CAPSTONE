import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { DeltaTraffic } from "@/hooks/useInterfaceTraffic";

interface Props {
    data: DeltaTraffic[];
}

const chartConfigIn: ChartConfig = {
    "LAN-IN": { label: "LAN", color: "var(--chart-1)" },
    "WAN-IN": { label: "WAN", color: "var(--chart-2)" },
    "OPT1-IN": { label: "OPT1", color: "var(--chart-3)" },
};

const chartConfigOut: ChartConfig = {
    "LAN-OUT": { label: "LAN", color: "var(--chart-1)" },
    "WAN-OUT": { label: "WAN", color: "var(--chart-2)" },
    "OPT1-OUT": { label: "OPT1", color: "var(--chart-3)" },
};

export const InterfaceTrafficChart = ({ data }: Props) => {
    const renderChart = (data: DeltaTraffic[], config: ChartConfig, title: string, description: string) => (
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
                                content={
                                    <ChartTooltipContent
                                        formatter={(value: string | number) => {
                                            const date = typeof value === "string" ? new Date(value) : new Date(value);
                                            return date.toLocaleTimeString();
                                        }}
                                        indicator="dot"
                                    />
                                }
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
            {renderChart(data, chartConfigIn, "Inbound Traffic", "Inbound bytes per interface.")}
            {renderChart(data, chartConfigOut, "Outbound Traffic", "Outbound bytes per interface.")}
        </div>
    );
};

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};
