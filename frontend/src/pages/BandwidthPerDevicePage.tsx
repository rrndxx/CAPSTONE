import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

type DeviceUsage = {
  id: number
  mac: string
  hostname: string
  currentUsageMbps: number
  averageUsageMbps: number
  maxLimitMbps: number
}

const sampleData: DeviceUsage[] = [
  {
    id: 1,
    mac: "00:1A:2B:3C:4D:5E",
    hostname: "Laptop-A",
    currentUsageMbps: 12.4,
    averageUsageMbps: 8.9,
    maxLimitMbps: 100,
  },
  {
    id: 2,
    mac: "BC:AE:C5:33:22:11",
    hostname: "Mobile-B",
    currentUsageMbps: 23.6,
    averageUsageMbps: 20.1,
    maxLimitMbps: 50,
  },
  {
    id: 3,
    mac: "D0:37:45:66:99:FF",
    hostname: "IoT-Cam-1",
    currentUsageMbps: 5.2,
    averageUsageMbps: 4.7,
    maxLimitMbps: 10,
  },
]

const BandwidthPerDevicePage = () => {
  const [search, setSearch] = useState("")

  const filteredDevices = sampleData.filter((device) =>
    Object.values(device)
      .some(val => val.toString().toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-4">Bandwidth Usage Per Device</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            type="text"
            placeholder="Search by MAC or hostname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Current Usage</TableHead>
                  <TableHead>Avg Usage</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Usage %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => {
                    const usagePercent = (device.currentUsageMbps / device.maxLimitMbps) * 100

                    return (
                      <TableRow key={device.id}>
                        <TableCell>{device.mac}</TableCell>
                        <TableCell>{device.hostname}</TableCell>
                        <TableCell className="text-blue-600 font-semibold">
                          {device.currentUsageMbps.toFixed(2)} Mbps
                        </TableCell>
                        <TableCell>{device.averageUsageMbps.toFixed(2)} Mbps</TableCell>
                        <TableCell>{device.maxLimitMbps} Mbps</TableCell>
                        <TableCell className="min-w-[140px]">
                          <Progress value={usagePercent} />
                          <span className="text-sm text-gray-600">{usagePercent.toFixed(1)}%</span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No devices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BandwidthPerDevicePage
