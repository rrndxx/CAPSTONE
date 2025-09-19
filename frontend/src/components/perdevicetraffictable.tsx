"use client"

import { useState, useEffect } from "react"
import type { DeviceTrafficSample } from "@/hooks/usePerDeviceTraffic"
import { usePerDeviceTraffic } from "@/hooks/usePerDeviceTraffic"
import { formatBytes } from "./perdevicetrafficchart"
import { Loader2 } from "lucide-react"

interface Props {
    viewType?: "All Devices" | "This Device"
    ipAddress?: string
}

export function PerDeviceTrafficTable({
    viewType = "All Devices",
    ipAddress,
}: Props) {
    const [trafficHistory, setTrafficHistory] = useState<DeviceTrafficSample[]>([])
    const latestSample = usePerDeviceTraffic()

    useEffect(() => {
        if (latestSample) {
            setTrafficHistory((prev) => [...prev.slice(-59), latestSample]) // keep last 60
        }
    }, [latestSample])

    if (!trafficHistory.length) {
        return (
            <span className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading
            </span>
        )
    }

    const totals: Record<string, { inBytes: number; outBytes: number }> = {}

    trafficHistory.forEach((sample) => {
        Object.keys(sample).forEach((key) => {
            if (key === "date") return

            const base = key.replace(/-IN|-OUT$/, "")
            if (!totals[base]) totals[base] = { inBytes: 0, outBytes: 0 }

            if (key.endsWith("-IN")) totals[base].inBytes += Number(sample[key] ?? 0)
            if (key.endsWith("-OUT")) totals[base].outBytes += Number(sample[key] ?? 0)
        })
    })

    let rows = Object.entries(totals).map(([addr, bytes]) => ({
        address: addr,
        inBytes: bytes.inBytes,
        outBytes: bytes.outBytes,
        totalBytes: bytes.inBytes + bytes.outBytes,
    }))

    if (viewType === "This Device" && ipAddress) {
        rows = rows.filter((row) => row.address === ipAddress)
    }

    // Wrapper classes (scroll strategy)
    const wrapperClass =
        viewType === "All Devices"
            ? "w-full min-w-0 overflow-x-auto"
            : "w-full min-w-0 overflow-x-hidden"

    return (
        <div className={wrapperClass}>
            {/* Height-limited scroll wrapper */}
            <div className="max-h-[300px] overflow-y-auto border border-gray-300 rounded-md">
                <table className="table-fixed w-full text-sm">
                    <thead className="bg-primary text-white sticky top-0 z-10">
                        {viewType === "All Devices" ? (
                            <tr>
                                <th className="px-4 py-2 border text-center">Device</th>
                                <th className="px-4 py-2 border text-center">Inbound</th>
                                <th className="px-4 py-2 border text-center">Outbound</th>
                                <th className="px-4 py-2 border text-center">Total</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-4 py-2 border text-center">Inbound</th>
                                <th className="px-4 py-2 border text-center">Outbound</th>
                                <th className="px-4 py-2 border text-center">Total</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {rows.length ? (
                            rows.map((row) =>
                                viewType === "All Devices" ? (
                                    <tr
                                        key={row.address}
                                        className="text-center odd:bg-muted/10"
                                    >
                                        <td className="px-4 py-2 border break-all">{row.address}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.inBytes)}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.outBytes)}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.totalBytes)}</td>
                                    </tr>
                                ) : (
                                    <tr
                                        key={row.address}
                                        className="text-center odd:bg-muted/10"
                                    >
                                        <td className="px-4 py-2 border">{formatBytes(row.inBytes)}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.outBytes)}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.totalBytes)}</td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    className="px-4 py-2 border text-center text-muted-foreground"
                                    colSpan={viewType === "All Devices" ? 4 : 3}
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
