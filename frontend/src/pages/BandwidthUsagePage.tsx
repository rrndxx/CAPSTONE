import { ChartArea } from "@/components/areachart"
import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { devices } from "@/constants/constants"
import { Download, Upload, Gauge } from "lucide-react"

const BandwidthUsagePage = () => {
    const totalDownload = devices.reduce((acc, d) => acc + d.download, 0)
    const totalUpload = devices.reduce((acc, d) => acc + d.upload, 0)

    const insights = [
        {
            icon: <Download className="w-6 h-6 text-chart-1" />,
            label: "Total Download",
            value: `${totalDownload.toFixed(1)} Mbps`,
        },
        {
            icon: <Upload className="w-6 h-6 text-chart-1" />,
            label: "Total Upload",
            value: `${totalUpload.toFixed(1)} Mbps`,
        },
        {
            icon: <Gauge className="w-6 h-6 text-chart-1" />,
            label: "Connected Devices",
            value: devices.length,
        },
    ]

    return (
        <SidebarInset>
            <div className="flex flex-col gap-6 p-4 pt-0">

                {/* 🧠 Summary Section */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {insights.map((item, i) => (
                        <div
                            key={i}
                            className="bg-card rounded-2xl shadow p-5 flex items-center gap-4 min-h-[100px]"
                        >
                            <div>{item.icon}</div>
                            <div className="flex flex-col">
                                <p className="text-lg font-semibold">{item.value}</p>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* 📈 Bandwidth Graph Section */}
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">Bandwidth Over Time</h2>
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow p-4 min-h-[300px]">
                        <ChartArea />
                    </div>
                </section>

                {/* 🖥️ Device Table Section */}
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">Per Device Bandwidth</h2>
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow p-4 min-h-[300px]">
                        {Array.isArray(devices) && devices.length > 0 ? (
                            <DevicesTable devices={devices} viewType="bandwidth" />
                        ) : (
                            <div className="text-muted-foreground text-sm text-center py-12">
                                No devices found.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </SidebarInset>
    )
}

export default BandwidthUsagePage
