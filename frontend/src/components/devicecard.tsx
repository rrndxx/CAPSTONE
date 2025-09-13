import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader as DialogHead,
  DialogTitle as DialogHeading,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import {
  Wifi,
  Server,
  Monitor,
  Laptop2,
  Download,
  Upload,
  Gauge,
  Ban,
  Settings,
  Globe,
  Info,
  ShieldCheck,
  Timer
} from "lucide-react"

import { type Device } from "./devicestable"
import { useState } from "react"

export function DeviceCard(device: Device) {
  const isOnline = device.status === "UP"
  const [bandwidth, setBandwidth] = useState("")

  return (
    <Card className="bg-muted/50 dark:bg-muted p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Hostname + Status */}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-chart-1 shrink-0" />
            <CardTitle className="text-base font-semibold truncate">
              {device.deviceHostname || "Unknown Device"}
            </CardTitle>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </CardHeader>

      {/* Short Info */}
      <CardContent className="text-sm mt-3 space-y-2">
        <InfoRow icon={<Server className="w-4 h-4" />} label="Hostname" value={device.deviceHostname ?? "—"} />
        <InfoRow icon={<Globe className="w-4 h-4" />} label="IP" value={device.deviceIp} />
        <InfoRow icon={<Settings className="w-4 h-4" />} label="MAC" value={device.deviceMac} />

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full mt-4">
              View Details
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHead>
              <DialogHeading className="flex items-center gap-2">
                <Info className="w-5 h-5" /> Device Details
              </DialogHeading>
              <DialogDescription>
                Manage <strong>{device.deviceHostname ?? device.deviceIp}</strong> and view technical details.
              </DialogDescription>
            </DialogHead>

            {/* Device Info Grid */}
            <section className="mt-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Device Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoRow icon={<Server className="w-4 h-4" />} label="Hostname" value={device.deviceHostname ?? "—"} />
                <InfoRow icon={<Globe className="w-4 h-4" />} label="IP" value={device.deviceIp} />
                <InfoRow icon={<Settings className="w-4 h-4" />} label="MAC" value={device.deviceMac} />
                <InfoRow icon={<Monitor className="w-4 h-4" />} label="OS" value={device.deviceOS ?? "Unknown"} />
                <InfoRow icon={<Download className="w-4 h-4" />} label="Download" value={device.download ? `${device.download} Mbps` : "—"} />
                <InfoRow icon={<Upload className="w-4 h-4" />} label="Upload" value={device.upload ? `${device.upload} Mbps` : "—"} />
                <InfoRow icon={<ShieldCheck className="w-4 h-4" />} label="Authorized" value={device.authorized ? "Yes" : "No"} />
                <InfoRow icon={<Ban className="w-4 h-4" />} label="Blocked" value={device.blocked ? "Yes" : "No"} />
              </div>
            </section>

            {/* Bandwidth Limiting */}
            <section className="mt-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Limit Bandwidth</h4>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter Mbps"
                  value={bandwidth}
                  onChange={(e) => setBandwidth(e.target.value)}
                  className="w-full"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!bandwidth || Number(bandwidth) <= 0) {
                      alert("Please enter a valid bandwidth limit.")
                    } else {
                      alert(`Applied bandwidth limit of ${bandwidth} Mbps to ${device.deviceHostname ?? device.deviceIp}`)
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </section>

            {/* Actions */}
            <section className="mt-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Actions</h4>
              <Button
                variant="destructive"
                onClick={() => alert(`Blocked ${device.deviceHostname ?? device.deviceIp}`)}
                className="w-full"
              >
                Block Device
              </Button>
            </section>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span className="text-xs font-medium">{label}:</span>
      <span className="truncate text-sm text-primary">{value}</span>
    </div>
  )
}
