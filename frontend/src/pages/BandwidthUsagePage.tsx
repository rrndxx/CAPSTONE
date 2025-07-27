import { ChartArea } from "@/components/areachart"
import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { devices } from "@/constants/constants"

const BandwidthUsagePage = () => {
    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    <ChartArea />
                </div>
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    {Array.isArray(devices) && devices.length > 0 ? (
                        <DevicesTable devices={devices} />
                    ) : (
                        <div>No devices found.</div>
                    )}
                </div>
            </div>
        </SidebarInset>
    )
}

export default BandwidthUsagePage