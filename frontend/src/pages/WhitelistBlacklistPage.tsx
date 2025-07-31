import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { devices } from "@/constants/constants"

const WhitelistBlacklistPage = () => {
    const whitelistedDevices = devices.filter(device => !device.blocked)
    const blacklistedDevices = devices.filter(device => device.blocked)

    return (
        <SidebarInset>
            <div className="flex flex-col flex-1 gap-6 p-4 pt-0">
                <Tabs defaultValue="whitelist" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
                            <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
                        </TabsList>

                    {/* Whitelist Tab */}
                    <TabsContent value="whitelist">
                        {/* <div className="flex justify-end my-4">
                            <Button className="bg-chart-3">Add to Whitelist</Button>
                        </div> */}
                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 min-h-[300px]">
                            {whitelistedDevices.length > 0 ? (
                                <DevicesTable devices={whitelistedDevices} viewType="whitelist" />
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-12">
                                    No whitelisted devices found.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Blacklist Tab */}
                    <TabsContent value="blacklist">
                        {/* <div className="flex justify-end my-4">
                            <Button className="bg-chart-3">Add to Blacklist</Button>
                        </div> */}
                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 min-h-[300px]">
                            {blacklistedDevices.length > 0 ? (
                                <DevicesTable devices={blacklistedDevices} viewType="blacklist" />
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-12">
                                    No blacklisted devices found.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </SidebarInset>
    )
}

export default WhitelistBlacklistPage
