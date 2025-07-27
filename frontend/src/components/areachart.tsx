import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const description = "An interactive bandwidth area chart"

const chartData =  [
    { date: "2024-04-01", upload: 110, download: 210 },
    { date: "2024-04-02", upload: 140, download: 260 },
    { date: "2024-04-03", upload: 125, download: 235 },
    { date: "2024-04-04", upload: 160, download: 285 },
    { date: "2024-04-05", upload: 150, download: 290 },
    { date: "2024-04-06", upload: 132, download: 255 },
    { date: "2024-04-07", upload: 178, download: 310 },
    { date: "2024-04-08", upload: 162, download: 295 },
    { date: "2024-04-09", upload: 138, download: 250 },
    { date: "2024-04-10", upload: 195, download: 320 },
    { date: "2024-04-11", upload: 168, download: 298 },
    { date: "2024-04-12", upload: 182, download: 325 },
    { date: "2024-04-13", upload: 157, download: 278 },
    { date: "2024-04-14", upload: 169, download: 307 },
    { date: "2024-04-15", upload: 144, download: 265 },
    { date: "2024-04-16", upload: 176, download: 292 },
    { date: "2024-04-17", upload: 159, download: 280 },
    { date: "2024-04-18", upload: 192, download: 319 },
    { date: "2024-04-19", upload: 205, download: 330 },
    { date: "2024-04-20", upload: 172, download: 289 },
    { date: "2024-04-21", upload: 149, download: 273 },
    { date: "2024-04-22", upload: 181, download: 308 },
    { date: "2024-04-23", upload: 136, download: 251 },
    { date: "2024-04-24", upload: 187, download: 317 },
    { date: "2024-04-25", upload: 174, download: 294 },
    { date: "2024-04-26", upload: 161, download: 282 },
    { date: "2024-04-27", upload: 193, download: 326 },
    { date: "2024-04-28", upload: 202, download: 338 },
    { date: "2024-04-29", upload: 179, download: 309 },
    { date: "2024-04-30", upload: 165, download: 295 },
];

const chartConfig = {
    upload: {
        label: "Upload (MBps)",
        color: "var(--chart-1)",
    },
    download: {
        label: "Download (MBps)",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ChartArea() {
    const [timeRange, setTimeRange] = React.useState("90d")

    const latestDate = new Date(chartData[chartData.length - 1].date)
    const daysToSubtract = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date(latestDate)
    startDate.setDate(latestDate.getDate() - daysToSubtract)

    const filteredData = chartData.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate
    })

    return (
        <Card className="pt-4">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 border-b py-4 px-4 sm:px-6">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">Bandwidth Usage</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Upload and download rates over the selected period
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-full sm:w-[160px] rounded-lg"
                        aria-label="Select time range"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d">Last 3 months</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-6 pt-4">
                <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfig} className="min-w-[480px] sm:min-w-0 w-full h-[250px]">
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="fillUpload" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-upload)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-upload)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillDownload" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-download)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-download)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            new Date(value as string).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="upload"
                                type="natural"
                                fill="url(#fillUpload)"
                                stroke="var(--color-upload)"
                                stackId="a"
                            />
                            <Area
                                dataKey="download"
                                type="natural"
                                fill="url(#fillDownload)"
                                stroke="var(--color-download)"
                                stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent payload={undefined} />} />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
