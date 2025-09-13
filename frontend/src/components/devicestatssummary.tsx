import {
  Smartphone,
  Wifi,
  Ban,
  ShieldCheck,
} from "lucide-react"

import { type Device } from "@/components/devicestable"

export function DevicesStatsSummary({ devices }: { devices: Device[] }) {
  const all = devices.length
  const online = devices.filter(d => d.status === "UP").length
  const blocked = devices.filter(d => !d.authorized).length
  const authorized = devices.filter(d => d.authorized).length

  const stats = [
    {
      icon: <Smartphone className="w-8 h-8 text-chart-1" />,
      label: "All Devices",
      value: all,
    },
    {
      icon: <Wifi className="w-8 h-8 text-chart-1" />,
      label: "Online Devices",
      value: online,
    },
    {
      icon: <Ban className="w-8 h-8 text-chart-1" />,
      label: "Blocked",
      value: blocked,
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-chart-1" />,
      label: "Authorized",
      value: authorized,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl shadow-sm border p-5 flex items-center gap-4 min-h-[100px]"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-md">
            {stat.icon}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xl font-semibold leading-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
