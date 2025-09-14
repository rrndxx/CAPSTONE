import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const description = "A radial chart with upload and download speed"

const chartData = [{ month: "july", upload: 40, download: 100 }]

const chartConfig = {
  upload: {
    label: "Upload",
    color: "var(--chart-1)",
  },
  download: {
    label: "Download",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Gauge() {
  const totalSpeed = chartData[0].upload + chartData[0].download

  const handleSpeedTest = () => {
    console.log("Speed test triggered.")
  }

  return (
    <div className="flex flex-col gap-6 bg-background">
      <Card className="flex flex-col">
        <CardHeader className="items-center justify-center pb-0 mt-2">
          <CardTitle className="text-center text-lg">Network Speed</CardTitle>
          <CardDescription className="text-center">
            Upload & Download Speed
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={120}
              outerRadius={180}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-semibold leading-tight"
                          >
                            {totalSpeed}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground text-sm"
                          >
                            Mbps
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="upload"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-upload)"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="download"
                fill="var(--color-download)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Showing average upload/download for the last 6 months
            </div>
          </div>
          <Button className="mt-2 w-full" onClick={handleSpeedTest}>
            Run Speed Test
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center justify-center pb-0 mt-2">
          <CardTitle className="text-center text-lg">Network Speed</CardTitle>
          <CardDescription className="text-center">
            Upload & Download Speed
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={120}
              outerRadius={180}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-semibold leading-tight"
                          >
                            {totalSpeed}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground text-sm"
                          >
                            Mbps
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="upload"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-upload)"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="download"
                fill="var(--color-download)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Showing average upload/download for the last 6 months
            </div>
          </div>
          <Button className="mt-2 w-full" onClick={handleSpeedTest}>
            Run Speed Test
          </Button>
        </CardFooter>
      </Card>
    </div>

  )
}
