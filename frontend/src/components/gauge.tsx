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
import {
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from "recharts"
import { CpuChart } from "./cpuchart"

export const description = "A radial chart with upload and download speed"

const defaultChartData = [{ month: "now", upload: 0, download: 0 }]

const chartConfig: ChartConfig = {
  upload: { label: "Upload", color: "var(--chart-1)" },
  download: { label: "Download", color: "var(--chart-2)" },
}

export function Gauge() {
  const [chartData, setChartData] = React.useState(defaultChartData)
  const [speedInfo, setSpeedInfo] = React.useState<null | Record<string, any>>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSpeedTest = async () => {
    setLoading(true)
    setSpeedInfo(null)
    setChartData(defaultChartData)

    try {
      const response = await fetch("http://localhost:4000/network/speedtest")
      const result = await response.json()
      if (result.success && result.data) {
        const data = result.data
        const uploadMbps = data.upload_bps / 1_000_000
        const downloadMbps = data.download_bps / 1_000_000
        setSpeedInfo({
          isp: data.isp,
          client_ip: data.client_ip,
          server_name: data.server.name,
          latency: data.server.latency,
          ping_ms: data.ping_ms,
          download: downloadMbps.toFixed(2),
          upload: uploadMbps.toFixed(2),
          timestamp: new Date(data.timestamp).toLocaleTimeString(), // time only
        })
        setChartData([{ month: "now", upload: uploadMbps, download: downloadMbps }])
      }
    } catch (err) {
      console.error("Error fetching speed test", err)
    } finally {
      setLoading(false)
    }
  }

  const details = [
    { icon: <Globe className="h-4 w-4" />, label: "ISP", value: speedInfo?.isp ?? "N/A" },
    { icon: <Wifi className="h-4 w-4" />, label: "Client IP", value: speedInfo?.client_ip ?? "N/A" },
    { icon: <Server className="h-4 w-4" />, label: "Server", value: speedInfo?.server_name ?? "N/A" },
    { icon: <Cpu className="h-4 w-4" />, label: "Latency", value: speedInfo ? `${speedInfo.latency.toFixed(2)} ms` : "0 ms" },
    { icon: <Upload className="h-4 w-4 text-green-500" />, label: "Upload", value: speedInfo ? `${speedInfo.upload} Mbps` : "0 Mbps" },
    { icon: <Download className="h-4 w-4 text-blue-500" />, label: "Download", value: speedInfo ? `${speedInfo.download} Mbps` : "0 Mbps" },
    { icon: <Clock className="h-4 w-4" />, label: "Ping", value: speedInfo ? `${speedInfo.ping_ms.toFixed(2)} ms` : "0 ms" },
    { icon: <Clock className="h-4 w-4" />, label: "Last Scan", value: speedInfo?.timestamp ?? "N/A" },
  ]

  return (
    <div className="flex flex-col gap-6 bg-background">
      <Card className="flex flex-col">
        {/* Header */}
        <CardHeader className="items-center justify-center pb-0 mt-2">
          <CardTitle className="text-center text-lg">Network Speed</CardTitle>
          <CardDescription className="text-center">Upload & Download Speed</CardDescription>
        </CardHeader>

        {/* Gauge */}
        <CardContent className="flex flex-1 items-center justify-center pb-0 min-h-[180px]">
          {loading ? (
            <Loader2 className="animate-spin h-12 w-12 text-muted-foreground" />
          ) : (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[280px]">
              <RadialBarChart data={chartData} endAngle={180} innerRadius={120} outerRadius={170}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              dy={-10}
                              className="fill-foreground text-2xl font-semibold leading-tight"
                            >
                              {speedInfo ? speedInfo.latency.toFixed(2) : "0"}
                            </tspan>

                            <tspan
                              x={viewBox.cx}
                              dy={24}
                              className="fill-muted-foreground text-lg"
                            >
                              ms
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar dataKey="upload" stackId="a" cornerRadius={5} fill="var(--chart-1)" />
                <RadialBar dataKey="download" stackId="a" cornerRadius={5} fill="var(--chart-2)" />
              </RadialBarChart>
            </ChartContainer>
          )}
        </CardContent>

        {/* Persistent Details */}
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 px-4 sm:px-6 text-sm min-h-[120px]">
          {details.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.icon}
              <span className="font-medium">{item.label}:</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </CardContent>

        {/* Run Button */}
        <CardFooter className="flex flex-col gap-4 text-sm">
          <Button
            className="mt-2 w-full flex items-center justify-center gap-2"
            onClick={handleSpeedTest}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? "Running..." : "Run Speed Test"}
          </Button>
        </CardFooter>

      </Card>

      <CPUInfoCard />
    </div>
  )
}

// function SystemInfoCard() {
//   const [system, setSystem] = React.useState<any>(null);

//   React.useEffect(() => {
//     fetch("http://localhost:4000/network/system-information")
//       .then((res) => res.json())
//       .then((data) => setSystem(data.data))
//       .catch((err) => console.error("Error fetching system info:", err));
//   }, []);

//   if (!system) return <p className="p-4 text-center">Loading system info...</p>;

//   const details = [
//     { icon: <Monitor className="h-4 w-4" />, label: "Name", value: system.name ?? "N/A" },
//     {
//       icon: <Layers className="h-4 w-4" />,
//       label: "Versions",
//       value: Array.isArray(system.versions) ? system.versions.join(", ") : system.versions ?? "N/A",
//     },
//   ];

//   return (
//     <Card>
//       <CardHeader className="items-center justify-center">
//         <CardTitle className="text-center text-lg flex items-center gap-2">
//           <Monitor className="h-5 w-5" /> System Information
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="grid gap-2 text-lg">
//         {details.map((item, index) => (
//           <div key={`${item.label}-${index}`} className="flex gap-2">
//             <span className="pt-2">{item.icon}</span>
//             <span className="font-medium">{item.label}:</span>
//             <span className="text-muted-foreground">{item.value}</span>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

function CPUInfoCard() {
  const [cpu, setCPU] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    fetch("http://localhost:4000/network/cpu-information")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCPU(data.data);
        } else {
          setCPU([]);
        }
      })
      .catch((err) => console.error("Error fetching CPU info:", err));
  }, []);

  if (!cpu) return <p className="p-4 text-center">Loading CPU info...</p>;

  return (
    <Card>
      <CardHeader className="items-center justify-center">
        <CardTitle className="text-center text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5" /> CPU Information
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm flex flex-col gap-1 ">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          <span className="text-muted-foreground">{cpu.join(", ")}</span>
        </div>
      </CardContent>
      <CpuChart />
    </Card>
  );
}



