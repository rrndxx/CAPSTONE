import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"

const BandwidthPerDevicePage = () => {
  const [search, setSearch] = useState("")

  // const filteredDevices = devices.filter((device) =>
  //   Object.values(device).some((val) =>
  //     val?.toString().toLowerCase().includes(search.toLowerCase())
  //   )
  // )

  // const limitedDevices = filteredDevices.filter((device) => device.bandwidthLimit > 0)
  // const unlimitedDevices = filteredDevices.filter((device) => device.bandwidthLimit === 0)

  return (
    <SidebarInset>
      <div className="flex flex-col flex-1 gap-6 p-4 pt-0">

        <Tabs defaultValue="limited" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="limited">Limited Devices</TabsTrigger>
            <TabsTrigger value="unlimited">Unlimited Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="limited">
            {/* <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 min-h-[300px]">
              {limitedDevices.length > 0 ? (
                <DevicesTable devices={limitedDevices} viewType="bandwidth" />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-12">
                  No limited devices found.
                </div>
              )}
            </div> */}
          </TabsContent>

          <TabsContent value="unlimited">
            {/* <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 min-h-[300px]">
              {unlimitedDevices.length > 0 ? (
                <DevicesTable devices={unlimitedDevices} viewType="bandwidth" />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-12">
                  No unlimited devices found.
                </div>
              )}
            </div> */}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}

export default BandwidthPerDevicePage
