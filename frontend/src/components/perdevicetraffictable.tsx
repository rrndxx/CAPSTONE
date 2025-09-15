"use client";

import type { DeviceTrafficSample } from "@/hooks/usePerDeviceTraffic";
import { formatBytes } from "./perdevicetrafficchart";

interface Props {
    data: DeviceTrafficSample[];
}

export function PerDeviceTrafficTable({ data }: Props) {
    const totals: Record<string, { inBytes: number; outBytes: number }> = {};

    data.forEach(sample => {
        Object.keys(sample).forEach(key => {
            if (key === "date") return;

            // Extract the base IP/device address
            const base = key.replace(/-IN|-OUT$/, "");

            if (!totals[base]) totals[base] = { inBytes: 0, outBytes: 0 };

            if (key.endsWith("-IN")) totals[base].inBytes += Number(sample[key] ?? 0);
            if (key.endsWith("-OUT")) totals[base].outBytes += Number(sample[key] ?? 0);
        });
    });

    const rows = Object.entries(totals).map(([addr, bytes]) => ({
        address: addr,
        inBytes: bytes.inBytes,
        outBytes: bytes.outBytes,
        totalBytes: bytes.inBytes + bytes.outBytes,
    }));

    return (
        <div className="mt-6 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Per-Device Traffic</h2>
            <table className="min-w-full border border-gray-300">
                <thead className="bg-primary">
                    <tr>
                        <th className="px-4 py-2 border">Device</th>
                        <th className="px-4 py-2 border">Inbound</th>
                        <th className="px-4 py-2 border">Outbound</th>
                        <th className="px-4 py-2 border">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <tr key={row.address} className="text-center">
                            <td className="px-4 py-2 border">{row.address}</td>
                            <td className="px-4 py-2 border">{formatBytes(row.inBytes)}</td>
                            <td className="px-4 py-2 border">{formatBytes(row.outBytes)}</td>
                            <td className="px-4 py-2 border">{formatBytes(row.totalBytes)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
