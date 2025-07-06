import { Pie, PieChart } from "recharts"

import { Card } from "@/components/ui/card"

const chartData = [
    { name: "value", value: 100, fill: "var(--chart-2)" },
    { name: "remaining", value: 185, fill: "var(--chart-1)" },
]

export function Piechart() {
    return (
        <Card className="flex flex-row items-center gap-4 p-4 w-full bg-primary-foreground">
            <div className="w-12 h-12">
                <PieChart width={48} height={48}>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        innerRadius={14}
                        outerRadius={24}
                        stroke="none"
                    />
                </PieChart>
            </div>
            <div className="flex flex-col">
                <div className="text-md font-semibold">100</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    Active Devices
                </div>
            </div>
        </Card>
    )
}
