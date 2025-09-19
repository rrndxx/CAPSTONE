import React from "react"
import { Server, Slash, ShieldCheck } from "lucide-react"

type StatItem = {
    icon: React.ReactNode
    label: string
    value: number
}

export function WebFilteringStatsSummary({
    dnsQueries,
    blockedSites,
    blockedAdultSites,
}: {
    dnsQueries: number
    blockedSites: number
    blockedAdultSites: number
}) {
    const stats: StatItem[] = [
        {
            icon: <Server className="w-8 h-8 text-chart-1" />,
            label: "DNS Queries",
            value: dnsQueries,
        },
        {
            icon: <Slash className="w-8 h-8 text-chart-1" />,
            label: "Blocked Sites",
            value: blockedSites,
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-chart-1" />,
            label: "Blocked Adult Sites",
            value: blockedAdultSites,
        },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-card rounded-xl shadow-sm border p-5 flex flex-row items-center gap-4 min-h-[100px]"
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
