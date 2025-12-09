import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogHead, DialogTitle as DialogHeading } from "@/components/ui/dialog"
import { Monitor, Server, Globe, Settings, Info, ShieldCheck } from "lucide-react"
import { PerDeviceTrafficTable } from "./perdevicetraffictable"
import { type Device } from "./devicestable"

export function DeviceCard(device: Device) {
  const isOnline = device.status === "UP"
  const [scanResult, setScanResult] = useState<any>(null)
  const [, setOpenScanDialog] = useState(false)
  const [isPortLoading, setIsPortLoading] = useState(false)

  const handleScanPorts = async () => {
    try {
      setIsPortLoading(true)
      const res = await fetch(`http://localhost:4000/scan/port?ip=${device.deviceIp}`)
      if (!res.ok) throw new Error("Failed to scan ports")
      const data = await res.json()
      setScanResult(data)
      setOpenScanDialog(true)
    } catch (err) {
      console.error(err)
      alert("Error scanning ports")
    } finally {
      setIsPortLoading(false)
    }
  }

  return (
    <Card className="bg-card p-4 rounded-xl shadow hover:shadow-md transition-shadow flex flex-col justify-between">
      <CardHeader className="pb-2 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Monitor className="w-6 h-6 text-chart-1 shrink-0" />
          <CardTitle className="text-base font-semibold truncate">{device.deviceHostname || "Unknown Device"}</CardTitle>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </CardHeader>

      <CardContent className="text-sm mt-3 space-y-2">
        <InfoRow icon={<Server className="w-4 h-4" />} label="Hostname" value={device.deviceHostname ?? "—"} />
        <InfoRow icon={<Globe className="w-4 h-4" />} label="IP" value={device.deviceIp} />
        <InfoRow icon={<Settings className="w-4 h-4" />} label="MAC" value={device.deviceMac} />
      </CardContent>

      <div className="mt-auto flex flex-col gap-2">
        <Dialog>
          {/* <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full">View Details</Button>
          </DialogTrigger> */}

          <DialogContent className="min-w-[85vw] max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden">
            {/* Use exact same detailed layout from DevicesTable */}
            <DialogHead>
              <DialogHeading className="flex justify-center items-center text-xl font-semibold">
                <span>{device.deviceHostname ?? "Unknown Device"}'s Details</span>
              </DialogHeading>
            </DialogHead>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {/* Device Overview */}
                <div className="col-span-1 bg-card border rounded-lg p-5 shadow-sm h-full flex flex-col">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-semibold">Device Overview</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    <InfoRow icon={<Server className="w-5 h-5" />} label="Hostname" value={device.deviceHostname ?? "—"} />
                    <InfoRow icon={<Globe className="w-5 h-5" />} label="IPv4" value={<code>{device.deviceIp}</code>} />
                    <InfoRow icon={<Settings className="w-5 h-5" />} label="MAC" value={<code>{device.deviceMac}</code>} />
                    <InfoRow icon={<Monitor className="w-5 h-5" />} label="OS" value={device.deviceOS ?? "Unknown"} />
                    <InfoRow icon={<ShieldCheck className="w-5 h-5" />} label="Whitelisted" value={device.authorized ? "Yes" : "No"} />
                    <InfoRow icon={<Info className="w-5 h-5" />} label="Last Seen" value={new Date(device.lastSeen).toLocaleTimeString()} />
                  </div>
                </div>

                {/* Ports & Security */}
                <div className="col-span-1 lg:col-span-2 bg-card border rounded-lg p-5 shadow-sm h-full flex flex-col">
                  <div className="flex justify-between items-center border-b">
                    <h3 className="text-lg font-semibold pb-2">Ports & Security</h3>
                    <Button size="sm" onClick={handleScanPorts}>{isPortLoading ? "Scanning..." : "Scan Ports"}</Button>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 mt-2">
                    {/* Port scan results table or message */}
                    <div className="rounded bg-muted/20 p-3 flex-1 flex flex-col justify-center items-center">
                      {scanResult?.open_ports?.length > 0 ? (
                        <ul className="list-disc list-inside text-sm">
                          {scanResult.open_ports.map((entry: any) => (
                            <li key={entry.port}>Port {entry.port} ({entry.service})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">
                          {scanResult ? "No open ports detected" : "No scans performed"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Activity */}
              <div className="col-span-1 lg:col-span-3 bg-card border rounded-lg p-5 shadow-sm mt-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Network Activity</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-md">Bandwidth Usage</h4>
                    <Button size="sm" onClick={() => alert("Apply rules")}>Apply Rules</Button>
                  </div>
                  <div className="min-h-[130px] flex justify-center items-center bg-muted/20 w-full">
                    <PerDeviceTrafficTable viewType="This Device" ipAddress={device.deviceIp} />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-md font-medium">{label}:</span>
      <span className="truncate text-sm">{value}</span>
    </div>
  )
}
