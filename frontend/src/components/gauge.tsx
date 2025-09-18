import * as React from "react"
import {
  Loader2,
  Server,
  Globe,
  Cpu,
  Upload,
  Download,
  Clock,
  Wifi,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

export const description = "A radial chart with upload and download speed"

const defaultChartData = [{ month: "now", upload: 0, download: 0 }]

const chartConfig: ChartConfig = {
  upload: { label: "Upload", color: "var(--chart-1)" },
  download: { label: "Download", color: "var(--chart-2)" },
}

type SpeedInfo = {
  isp: string
  client_ip: string
  server_name: string
  latency: string
  ping_ms: string
  upload: string
  download: string
  timestamp: string
}

type GaugeProps = {
  className?: string
}

async function runSpeedTest(): Promise<SpeedInfo> {
  const response = await fetch("http://localhost:4000/network/speedtest")
  const result = await response.json()

  if (!result.success || !result.data) {
    throw new Error("Speed test failed")
  }

  const data = result.data
  const uploadMbps = data.upload_bps / 1_000_000
  const downloadMbps = data.download_bps / 1_000_000

  return {
    isp: data.isp,
    client_ip: data.client_ip,
    server_name: data.server.name,
    latency: data.server.latency.toFixed(2),
    ping_ms: data.ping_ms.toFixed(2),
    upload: uploadMbps.toFixed(2),
    download: downloadMbps.toFixed(2),
    timestamp: new Date(data.timestamp).toLocaleTimeString(),
  }
}

export function Gauge({ className }: GaugeProps) {
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = React.useState(false)

  // Get cached speed info (if exists)
  const speedInfo = queryClient.getQueryData<SpeedInfo>(["speedtest"])

  // Mutation for running speed test
  const { mutate, isPending, isError } = useMutation({
    mutationFn: runSpeedTest,
    onSuccess: (data) => {
      queryClient.setQueryData(["speedtest"], data) // store in cache
      setOpenDialog(true)
    },
    onError: () => {
      setOpenDialog(true)
    },
  })

  // chart data
  const chartData =
    speedInfo != null
      ? [
        {
          month: "now",
          upload: Number(speedInfo.upload),
          download: Number(speedInfo.download),
        },
      ]
      : defaultChartData

  const details = speedInfo
    ? [
      { icon: <Globe className="h-4 w-4" />, label: "ISP", value: speedInfo.isp },
      { icon: <Wifi className="h-4 w-4" />, label: "Client IP", value: speedInfo.client_ip },
      { icon: <Server className="h-4 w-4" />, label: "Server", value: speedInfo.server_name },
      { icon: <Cpu className="h-4 w-4" />, label: "Latency", value: `${speedInfo.latency} ms` },
      { icon: <Upload className="h-4 w-4 text-green-500" />, label: "Upload", value: `${speedInfo.upload} Mbps` },
      { icon: <Download className="h-4 w-4 text-blue-500" />, label: "Download", value: `${speedInfo.download} Mbps` },
      { icon: <Clock className="h-4 w-4" />, label: "Ping", value: `${speedInfo.ping_ms} ms` },
      { icon: <Clock className="h-4 w-4" />, label: "Last Scan", value: speedInfo.timestamp },
    ]
    : []

  return (
    <>
      <Card className={cn("flex flex-col w-full h-full justify-between", className)}>
        {/* Header */}
        <CardHeader className="items-center justify-center pb-0 mt-2 text-center">
          <CardTitle className="text-lg">Network Speed</CardTitle>
          <CardDescription>Upload & Download Speed</CardDescription>
        </CardHeader>

        {/* Gauge */}
        <CardContent className="flex flex-col items-center gap-4 py-4">
          {isPending ? (
            <div className="aspect-square w-48 flex justify-center items-center">
              <Loader2 className="animate-spin h-24 w-24 text-muted-foreground" />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-square w-48">
              <RadialBarChart data={chartData} endAngle={180} innerRadius={80} outerRadius={110}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox && "cy" in viewBox ? (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            dy={-10}
                            className="fill-foreground text-3xl font-semibold leading-tight"
                          >
                            {speedInfo
                              ? ((+speedInfo.upload + +speedInfo.download) / 2).toFixed(2)
                              : "0"}
                          </tspan>
                          <tspan x={viewBox.cx} dy={24} className="fill-muted-foreground text-lg">
                            Mbps
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </PolarRadiusAxis>
                <RadialBar dataKey="upload" stackId="a" cornerRadius={5} fill="var(--chart-1)" />
                <RadialBar dataKey="download" stackId="a" cornerRadius={5} fill="var(--chart-2)" />
              </RadialBarChart>
            </ChartContainer>
          )}
        </CardContent>

        {/* Run Button */}
        <CardFooter className="flex flex-col gap-4 text-sm">
          <Button
            className="w-full h-18 rounded-2xl flex items-center justify-center gap-2 bg-chart-2"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin h-4 w-4" />}
            {isPending ? "Running..." : "Run Speed Test"}
          </Button>
        </CardFooter>
      </Card>

      {/* Result Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {isError ? (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Internal Server Error</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <span className="font-medium">
                Error getting best servers. Please try again later
              </span>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        ) : (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Speed Test Results</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              {details.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-medium">{item.label}:</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

