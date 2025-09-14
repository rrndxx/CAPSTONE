"use client"

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

const chartConfigLan = {
    lanIn: {
        label: "In",
        color: "var(--chart-1)",
    },
    lanOut: {
        label: "Out",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

const chartConfigWan = {
    wanIn: {
        label: "In",
        color: "var(--bytein)",
    },
    wanOut: {
        label: "Out",
        color: "var(--byteout)",
    },
} satisfies ChartConfig

export function ChartArea() {
    const [lanData, setLanData] = React.useState<
        { date: string; lanIn: number; lanOut: number }[]
    >([])
    const [wanData, setWanData] = React.useState<
        { date: string; wanIn: number; wanOut: number }[]
    >([])

    // Buffers for raw samples
    const lanBuffer = React.useRef<{ inbytes: number; outbytes: number }[]>([])
    const wanBuffer = React.useRef<{ inbytes: number; outbytes: number }[]>([])

    React.useEffect(() => {
        const source = new EventSource("http://localhost:4000/stream1")

        source.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data)
                const { lan, wan } = parsed.interfaces

                // Store raw values into buffers
                lanBuffer.current.push({ inbytes: lan.inbytes, outbytes: lan.outbytes })
                wanBuffer.current.push({ inbytes: wan.inbytes, outbytes: wan.outbytes })
            } catch (err) {
                console.error("Invalid SSE payload:", event.data)
            }
        }

        source.onerror = (err) => {
            console.error("SSE connection error", err)
            source.close()
        }

        // Every 4 seconds, flush buffers into chart data
        const interval = setInterval(() => {
            if (lanBuffer.current.length > 0 || wanBuffer.current.length > 0) {
                const timestamp = new Date().toISOString()

                // Aggregate LAN
                if (lanBuffer.current.length > 0) {
                    const sumIn = lanBuffer.current.reduce((a, b) => a + b.inbytes, 0)
                    const sumOut = lanBuffer.current.reduce((a, b) => a + b.outbytes, 0)

                    setLanData((prev) =>
                        [
                            ...prev,
                            { date: timestamp, lanIn: sumIn, lanOut: sumOut },
                        ].slice(-8) // keep ~last 30s (8 points = 32s)
                    )
                    lanBuffer.current = []
                }

                // Aggregate WAN
                if (wanBuffer.current.length > 0) {
                    const sumIn = wanBuffer.current.reduce((a, b) => a + b.inbytes, 0)
                    const sumOut = wanBuffer.current.reduce((a, b) => a + b.outbytes, 0)

                    setWanData((prev) =>
                        [
                            ...prev,
                            { date: timestamp, wanIn: sumIn, wanOut: sumOut },
                        ].slice(-8)
                    )
                    wanBuffer.current = []
                }
            }
        }, 4000)

        return () => {
            source.close()
            clearInterval(interval)
        }
    }, [])

    const renderChart = (
        data: any[],
        config: ChartConfig,
        title: string,
        description: string
    ) => (
        <Card className="pt-4">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 border-b py-4 px-4 sm:px-6">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {data.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                        Latest: In{" "}
                        {formatBytes(
                            data[data.length - 1][Object.keys(config)[0]] as number
                        )}{" "}
                        · Out{" "}
                        {formatBytes(
                            data[data.length - 1][Object.keys(config)[1]] as number
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-6 pt-4">
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
        <div className="space-y-6 bg-background">
            {renderChart(
                lanData,
                chartConfigLan,
                "LAN Traffic",
                "Showing in/out per bytes LAN interface traffic."
            )}
            {renderChart(
                wanData,
                chartConfigWan,
                "WAN Traffic",
                "Showing WAN interface in/out per bytes."
            )}
        </div>
    )
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
}
