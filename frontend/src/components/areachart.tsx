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

const chartConfig = {
    inBytes: { label: "Bytes In", color: "var(--color-primary)" },
    outBytes: { label: "Bytes Out", color: "var(--color-destructive)" },
} satisfies ChartConfig

export function ChartArea() {
    const [lanData, setLanData] = React.useState<{ date: string; inBytes: number; outBytes: number }[]>([])
    const [wifiData, setWifiData] = React.useState<{ date: string; inBytes: number; outBytes: number }[]>([])

    const lanBuffer = React.useRef<{ inBytes: number; outBytes: number }[]>([])
    const wifiBuffer = React.useRef<{ inBytes: number; outBytes: number }[]>([])

    React.useEffect(() => {
        const source = new EventSource("http://localhost:4000/stream1")

        source.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data)
                const lan = parsed.interfaces.lan
                const wifi = parsed.interfaces.opt2

                lanBuffer.current.push({ inBytes: lan.inbytes, outBytes: lan.outbytes })
                wifiBuffer.current.push({ inBytes: wifi.inbytes, outBytes: wifi.outbytes })
            } catch (err) {
                console.error("Invalid SSE payload:", event.data)
            }
        }

        source.onerror = (err) => {
            console.error("SSE connection error", err)
            source.close()
        }

        const interval = setInterval(() => {
            const timestamp = new Date().toISOString()

            if (lanBuffer.current.length > 0) {
                const totalIn = lanBuffer.current.reduce((sum, b) => sum + b.inBytes, 0)
                const totalOut = lanBuffer.current.reduce((sum, b) => sum + b.outBytes, 0)
                setLanData((prev) => [...prev, { date: timestamp, inBytes: totalIn, outBytes: totalOut }].slice(-8))
                lanBuffer.current = []
            }

            if (wifiBuffer.current.length > 0) {
                const totalIn = wifiBuffer.current.reduce((sum, b) => sum + b.inBytes, 0)
                const totalOut = wifiBuffer.current.reduce((sum, b) => sum + b.outBytes, 0)
                setWifiData((prev) => [...prev, { date: timestamp, inBytes: totalIn, outBytes: totalOut }].slice(-8))
                wifiBuffer.current = []
            }
        }, 4000)

        return () => {
            source.close()
            clearInterval(interval)
        }
    }, [])

    const renderChart = (data: typeof lanData, title: string, description: string) => (
        <Card className="flex-1 pt-4 border  border-[color:var(--color-border)] shadow-[var(--shadow)]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary sm:gap-2 border-b border-[color:var(--color-border)] py-4 px-4 sm:px-6">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-black">{description}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-6 pt-4">
                <div className="w-full overflow-x-auto">
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <AreaChart data={data}>
                            <CartesianGrid vertical={false} stroke="var(--border)" />
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
                            {(Object.keys(chartConfig) as (keyof typeof chartConfig)[]).map((key) => (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    type="monotone"
                                    stroke={chartConfig[key].color}
                                    fillOpacity={0.15}
                                    fill={chartConfig[key].color}
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
        <div className="flex flex-col md:flex-row gap-4 text-[color:var(--color-foreground)]">
            <div className="flex-1 min-w-0">
                {renderChart(lanData, "Bandwidth Traffic Overview", "Showing LAN interface in/out bytes over time.")}
            </div>
            {/* <div className="flex-1 min-w-0">
                {renderChart(wifiData, "Wireless Traffic", "Showing Wireless interface in/out bytes over time.")}
            </div> */}
        </div>
    )
}


