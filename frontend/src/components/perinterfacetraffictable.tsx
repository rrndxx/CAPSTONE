import type { DeltaTraffic } from "@/hooks/useInterfaceTraffic"

type OptInterfaces = "OPT1" | "OPT2"

const interfaces: OptInterfaces[] = ["OPT1", "OPT2"]

interface Props {
    data: DeltaTraffic[]
}

export function PerInterfaceTraffic({ data }: Props) {
    return <PerInterfaceTrafficTable data={data} />
}

const interfaceLabels: Record<"OPT1" | "OPT2", string> = {
  OPT1: "Wired",
  OPT2: "Wireless",
};

interface TableProps {
    data: DeltaTraffic[]
}

export function PerInterfaceTrafficTable({ data }: TableProps) {
    const totals: Record<OptInterfaces, { inBytes: number; outBytes: number }> = {
        OPT1: { inBytes: 0, outBytes: 0 },
        OPT2: { inBytes: 0, outBytes: 0 },
    }

    data.forEach((sample) => {
        interfaces.forEach((intf) => {
            totals[intf].inBytes += (sample[`${intf}-IN`] as number) || 0
            totals[intf].outBytes += (sample[`${intf}-OUT`] as number) || 0
        })
    })

    return (
        <div className="mt-6">
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-primary">
                        <tr>
                            <th className="px-4 py-2 border">Interface</th>
                            <th className="px-4 py-2 border">Inbound Bytes</th>
                            <th className="px-4 py-2 border">Outbound Bytes</th>
                            <th className="px-4 py-2 border">Total Bytes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interfaces.map((intf) => (
                            <tr key={intf} className="text-center">
                                <td className="px-4 py-2 border">{interfaceLabels[intf]}</td>
                                <td className="px-4 py-2 border">{formatBytes(totals[intf].inBytes)}</td>
                                <td className="px-4 py-2 border">{formatBytes(totals[intf].outBytes)}</td>
                                <td className="px-4 py-2 border">{formatBytes(totals[intf].inBytes + totals[intf].outBytes)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
}
