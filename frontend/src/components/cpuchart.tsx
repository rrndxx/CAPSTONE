import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Chart config for CPU usage
const chartConfigCpu = {
    total: { label: "Total", color: "var(--chart-1)" },
    user: { label: "User", color: "var(--chart-2)" },
    sys: { label: "System", color: "var(--chart-3)" },
    idle: { label: "Idle", color: "var(--chart-4)" },
} satisfies ChartConfig

export function CpuChart() {
    const [cpuData, setCpuData] = React.useState<
        { date: string; total: number; user: number; sys: number; idle: number }[]
    >([])

    // Buffer for raw samples
    const cpuBuffer = React.useRef<{ total: number; user: number; sys: number; idle: number }[]>([])

    React.useEffect(() => {
        const source = new EventSource("http://localhost:4000/stream/cpu")

        source.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data)
                cpuBuffer.current.push(parsed)
            } catch (err) {
                console.error("Invalid SSE payload:", event.data)
            }
        }

        source.onerror = (err) => {
            console.error("SSE connection error", err)
            source.close()
        }

        const interval = setInterval(() => {
            if (cpuBuffer.current.length > 0) {
                const timestamp = new Date().toISOString()

                const sum = cpuBuffer.current.reduce(
                    (acc, cur) => ({
                        total: acc.total + cur.total,
                        user: acc.user + cur.user,
                        sys: acc.sys + cur.sys,
                        idle: acc.idle + cur.idle,
                    }),
                    { total: 0, user: 0, sys: 0, idle: 0 }
                )
                const count = cpuBuffer.current.length
                const averaged = {
                    date: timestamp,
                    total: sum.total / count,
                    user: sum.user / count,
                    sys: sum.sys / count,
                    idle: sum.idle / count,
                }

                setCpuData((prev) => [...prev, averaged].slice(-20))
                cpuBuffer.current = []
            }
        }, 2000)

        return () => {
            source.close()
            clearInterval(interval)
        }
    }, [])

    const renderChart = (
        data: any[],
        config: ChartConfig,
    ) => (
        <Card className="pt-4">
            <CardContent className="">
                <div className="w-full overflow-x-auto">
                    <ChartContainer
                        config={config}
                        className="min-w-[300px] sm:min-w-0 w-full h-[300px]"
                    >
                        <AreaChart data={data}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })
                                }
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            new Date(value as string).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })
                                        }
                                        indicator="dot"
                                    />
                                }
                            />

                            {Object.keys(config).map((key) => (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    type="monotone"
                                    stroke={config[key].color}
                                    fillOpacity={0.15}
                                    fill={config[key].color}
                                    strokeWidth={2}
                                    animationDuration={300}
                                />
                            ))}
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="bg-background">
            {renderChart(cpuData, chartConfigCpu)}
        </div>
    )
}
