import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDevices } from "@/hooks/useDevices"

const WhitelistBlacklistPage = () => {
    const { data: devices = [], isLoading } = useDevices(2)

    // Trust Status will come from backend: "WHITELISTED" | "BLACKLISTED" | "NEUTRAL"
    const whitelistedDevices = devices.filter((d: { trustStatus: string }) => d.trustStatus === "WHITELISTED")
    const blacklistedDevices = devices.filter((d: { trustStatus: string }) => d.trustStatus === "BLACKLISTED")
    const neutralDevices = devices.filter((d: { trustStatus: string }) => d.trustStatus === "NEUTRAL")

    return (
        <SidebarInset>
            <div className="flex flex-col flex-1 gap-6 p-4 pt-0">
                <Tabs defaultValue="whitelist" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
                        <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
                        <TabsTrigger value="neutral">Neutral</TabsTrigger>
                    </TabsList>

                    {/* WHITELIST TAB */}
                    <TabsContent value="whitelist">
                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4">
                            {whitelistedDevices.length > 0 ? (
                                <DevicesTable devices={whitelistedDevices} viewType="whitelist" />
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-12">
                                    No whitelisted devices found.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* BLACKLIST TAB */}
                    <TabsContent value="blacklist">
                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4">
                            {blacklistedDevices.length > 0 ? (
                                <DevicesTable devices={blacklistedDevices} viewType="blacklist" />
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-12">
                                    No blacklisted devices found.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* NEUTRAL DEVICES TAB */}
                    <TabsContent value="neutral">
                        <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4">
                            {neutralDevices.length > 0 ? (
                                <DevicesTable devices={neutralDevices} viewType="neutral" />
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-12">
                                    No neutral devices found.
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
