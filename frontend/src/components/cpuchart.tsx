import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts"
import { Cpu } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"

const chartConfigCpu: ChartConfig = {
    total: { label: "Total", color: "var(--chart-1)" },
    user: { label: "User", color: "var(--chart-2)" },
    sys: { label: "System", color: "var(--chart-3)" },
    idle: { label: "Idle", color: "var(--chart-4)" },
}

export function CpuChart({ cpuinfo }: { cpuinfo: string[] }) {
    const [cpuData, setCpuData] = React.useState<
        { date: string; total: number; user: number; sys: number; idle: number }[]
    >([])

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
                setCpuData((prev) => [...prev, { date: timestamp, total: sum.total / count, user: sum.user / count, sys: sum.sys / count, idle: sum.idle / count }].slice(-20))
                cpuBuffer.current = []
            }
        }, 2000)

        return () => {
            source.close()
            clearInterval(interval)
        }
    }, [])

    return (
        <Card className="w-full">
            <CardHeader className="items-center justify-center text-center">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5" /> CPU Information
                </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 text-sm">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">{cpuinfo.join(", ")}</span>
            </div>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfigCpu} className="min-w-[300px] sm:min-w-0 w-full h-[300px]">
                        <AreaChart data={cpuData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                }
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            new Date(value as string).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                        }
                                        indicator="dot"
                                    />
                                }
                            />
                            {Object.keys(chartConfigCpu).map((key) => (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    type="monotone"
                                    stroke={chartConfigCpu[key].color}
                                    fillOpacity={0.15}
                                    fill={chartConfigCpu[key].color}
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
}
