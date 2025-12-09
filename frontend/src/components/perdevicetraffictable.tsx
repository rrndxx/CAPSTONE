"use client"

import { Loader2 } from "lucide-react";
import { formatBytes, type DeviceTrafficEntry } from "./perdevicetrafficchart";

interface Props {
    trafficData: DeviceTrafficEntry[];
    viewType?: "All Devices" | "This Device";
    ipAddress?: string;
}

export function PerDeviceTrafficTable({ trafficData, viewType = "All Devices", ipAddress }: Props) {
    if (!trafficData.length) {
        return (
            <span className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading
            </span>
        );
    }

    // Compute totals per device
    const totals: Record<string, { inBytes: number; outBytes: number }> = {};
    trafficData.forEach((device) => {
        totals[device.deviceMac] = {
            inBytes: device.uploadTotal,
            outBytes: device.downloadTotal,
        };
    });


    let rows = Object.entries(totals).map(([addr, bytes]) => ({
        address: addr,
        inBytes: bytes.inBytes,
        outBytes: bytes.outBytes,
        totalBytes: bytes.inBytes + bytes.outBytes,
    }));

    if (viewType === "This Device" && ipAddress) {
        rows = rows.filter((row) => row.address === ipAddress);
    }

    const wrapperClass =
        viewType === "All Devices"
            ? "w-full min-w-0 overflow-x-auto"
            : "w-full min-w-0 overflow-x-hidden";

    return (
        <div className={wrapperClass}>
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
                                    <tr key={row.address} className="text-center odd:bg-muted/10">
                                        <td className="px-4 py-2 border break-all">{row.address}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.inBytes)}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.outBytes)}</td>
                                        <td className="px-4 py-2 border">{formatBytes(row.totalBytes)}</td>
                                    </tr>
                                ) : (
                                    <tr key={row.address} className="text-center odd:bg-muted/10">
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
    );
}
