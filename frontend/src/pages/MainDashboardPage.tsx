import { ChartArea } from "@/components/areachart"
import { SidebarInset } from "@/components/ui/sidebar"
import { Wifi, Smartphone, AlertCircle } from "lucide-react"

export default function MainDashboardPage() {
    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-4 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-chart-1 aspect-video rounded-xl shadow flex items-center justify-center p-4">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-10 h-10 text-green-500" />
                                    <div className="flex flex-col justify-start">
                                        <p className="text-xl font-semibold">128</p>
                                        <p className="text-sm text-muted-foreground">Connected Devices</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-chart-1 aspect-video rounded-xl shadow flex items-center justify-center p-4">
                                <div className="flex items-center gap-3">
                                    <Wifi className="w-10 h-10 text-blue-500" />
                                    <div className="flex flex-col justify-start">
                                        <p className="text-base font-medium text-green-600">42 Mbps</p>
                                        <p className="text-sm text-muted-foreground">ISP Status</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-chart-1 aspect-video rounded-xl shadow hidden md:flex items-center justify-center p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-10 h-10 text-yellow-500" />
                                    <div className="flex flex-col justify-start">
                                        <p className="text-xl font-semibold text-yellow-600">3 Active</p>
                                        <p className="text-sm text-muted-foreground">Critical Alerts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                            <ChartArea />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                        <p className="text-muted-foreground">Something</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-muted/50 rounded-xl shadow min-h-[300px] p-4">
                    <p className="text-muted-foreground">Something</p>
                </div>
            </div>
        </SidebarInset>
    );
}
