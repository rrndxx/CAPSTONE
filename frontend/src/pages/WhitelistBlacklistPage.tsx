import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"

const WhitelistBlacklistPage = () => {
    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="pt-4 flex justify-between">
                    <h1 className="pt-4">Whitelist</h1>
                    <button className="px-4 py-2 rounded sm bg-chart-3">Add</button>
                </div>
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    <DevicesTable />
                </div>
                <div className="pt-4 flex justify-between">
                    <h1 className="pt-4">Blacklist</h1>
                    <button className="px-4 py-2 rounded sm bg-chart-3">Add</button>
                </div>
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    <DevicesTable />
                </div>
            </div>
        </SidebarInset >
    )
}

export default WhitelistBlacklistPage