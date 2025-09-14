import React, { useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    type ColumnDef,
    flexRender,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table"
import { WebFilteringStatsSummary } from "@/components/webfilteringstatssummary"
import { Button } from "@/components/ui/button"

type DomainStat = { name: string; count: number }
type ClientStat = { ip: string; count: number }

const WebFilteringPage: React.FC = () => {
    const [topDomains] = useState<DomainStat[]>([
        { name: "example.com", count: 50 },
        { name: "google.com", count: 30 },
    ])
    const [topClients] = useState<ClientStat[]>([
        { ip: "192.168.1.2", count: 40 },
        { ip: "192.168.1.3", count: 20 },
    ])
    const [blockedDomains] = useState<string[]>(["badsite.com", "adultsite.com"])
    const [dnsQueries] = useState<number[]>([50, 30, 20, 10])
    const [globalFilter, setGlobalFilter] = useState("")

    // Stats
    const numDNSQueries = dnsQueries.reduce((a, b) => a + b, 0)
    const numBlockedSites = blockedDomains.length
    const numBlockedAdultSites = blockedDomains.filter((d) => d.includes("adult")).length

    // Columns
    const domainColumns: ColumnDef<DomainStat>[] = [
        { accessorKey: "name", header: "Domain" },
        { accessorKey: "count", header: "Count" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={() => alert(`Block ${row.original.name} for all devices`)}>
                        Block to All
                    </Button>
                    <Button size="sm" onClick={() => alert(`Block ${row.original.name} from a device`)}>
                        Block from Device
                    </Button>
                </div>
            ),
        },
    ]

    const clientColumns: ColumnDef<ClientStat>[] = [
        { accessorKey: "ip", header: "IP" },
        { accessorKey: "count", header: "Count" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={() => alert(`Block web access for ${row.original.ip}`)}>
                        Block Web Access
                    </Button>
                    <Button size="sm" onClick={() => alert(`Block a site for ${row.original.ip}`)}>
                        Block A Site
                    </Button>
                </div>
            ),
        },
    ]

    const blockedColumns: ColumnDef<string>[] = [
        { accessorFn: (d) => d, id: "domain", header: "Blocked Domains" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button size="sm" variant="destructive" onClick={() => alert(`Unblocking ${row.original}`)}>
                    Unblock
                </Button>
            ),
        },
    ]

    // Tables
    const domainTable = useReactTable({
        data: topDomains,
        columns: domainColumns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const clientTable = useReactTable({
        data: topClients,
        columns: clientColumns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const blockedTable = useReactTable({
        data: blockedDomains,
        columns: blockedColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <SidebarInset>
            <div className="flex flex-col gap-6 p-4 pt-0">
                {/* Top Stats Cards */}
                <WebFilteringStatsSummary
                    dnsQueries={numDNSQueries}
                    blockedSites={numBlockedSites}
                    blockedAdultSites={numBlockedAdultSites}
                />

                {/* Tables stacked in column */}
                <div className="flex flex-col gap-6 w-full">
                    {/* Top Domains Table */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 w-full overflow-auto">
                        <h2 className="text-lg font-semibold mb-2">Top Domains</h2>
                        <Table className="w-full">
                            <TableHeader>
                                {domainTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-center">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {domainTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Top Clients Table */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 w-full overflow-auto">
                        <h2 className="text-lg font-semibold mb-2">Top Clients</h2>
                        <Table className="w-full">
                            <TableHeader>
                                {clientTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-center">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {clientTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Blocked Domains Table */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 w-full overflow-auto">
                        <h2 className="text-lg font-semibold mb-2">Blocked Domains</h2>
                        <Table className="w-full">
                            <TableHeader>
                                {blockedTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-center">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {blockedTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </SidebarInset>
    )
}

export default WebFilteringPage
