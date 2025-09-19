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

const chartConfig: ChartConfig = {
    "OPT1-IN": { label: "Wired", color: "var(--destructive)" },
    "OPT2-IN": { label: "Wireless", color: "var(--chart-4)" },
    "OPT1-OUT": { label: "Wired", color: "var(--destructive)" },
    "OPT2-OUT": { label: "Wireless", color: "var(--chart-4)" },
};

export const InterfaceTrafficChart = ({ data }: Props) => {
    const renderChart = (keys: (keyof typeof chartConfig)[], title: string, description: string) => (
        <Card className="pt-4 flex-1">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 border-b py-4 px-4 sm:px-6 bg-primary">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-black">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 pt-4">
                <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfig} className="min-w-[300px] sm:min-w-0 w-full h-[300px]">
                        <LineChart data={data}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => value ? new Date(value).toLocaleTimeString() : ""}
                            />
                            <YAxis tickFormatter={(val) => formatBytes(Number(val))} />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            value ? new Date(value as string).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            }) : ""
                                        }
                                        indicator="dot"
                                    />
                                }
                            />
                            {keys.map((key) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={chartConfig[key].color}
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
        <div className="flex flex-col md:flex-row gap-6 bg-background">
            {renderChart(["OPT1-IN", "OPT2-IN"], "Inbound Traffic", "Inbound bytes for OPT1 and OPT2.")}
            {renderChart(["OPT1-OUT", "OPT2-OUT"], "Outbound Traffic", "Outbound bytes for OPT1 and OPT2.")}
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
