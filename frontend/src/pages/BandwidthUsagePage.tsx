import { ChartArea } from "@/components/areachart"
import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"

const BandwidthUsagePage = () => {
    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    <ChartArea />
                </div>
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    <DevicesTable />
                </div>
            </div>
        </SidebarInset>
    )
}

export default BandwidthUsagePage