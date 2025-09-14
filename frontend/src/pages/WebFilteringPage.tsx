import React, { useState, useMemo } from "react"
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { blockDomain, blockUser, fetchDeviceQueryLogs, unblockUser, useDNSStats } from "@/hooks/useWebFiltering"
import { useDevices } from "@/hooks/useDevices"
import { InfoRow } from "@/components/devicestable"
import { Server, Globe, Settings, Monitor } from "lucide-react"

type DomainStat = { name: string; count: number }
type ClientStat = { ip: string; count: number; hostname?: string; mac?: string, os?: string }
type DNSQuery = { time: string; domain: string }

const WebFilteringPage: React.FC = () => {
    const { data, isLoading, isError } = useDNSStats()
    const { data: devicesData } = useDevices(2)
    const [selectedClient, setSelectedClient] = useState<ClientStat | null>(null)
    const [clientQueries, setClientQueries] = useState<DNSQuery[]>([])
    const [irrelevantDomains, setIrrelevantDomains] = useState<string[]>([
        "2.opnsense.pool.ntp.org",
        "3.opnsense.pool.ntp.org",
        "0.opnsense.pool.ntp.org",
        "1.opnsense.pool.ntp.org",
        "0.opnsense.pool.ntp.org.internal",
        "238.220.251.142.in-addr.arpa",
        "e.0.0.2.0.0.0.0.0.0.0.0.0.0.0.0.3.0.8.0.7.1.0.4.0.0.8.6.4.0.4.2.ip6.arpa",
        "209.155.64.172.in-addr.arpa",
        "47.32.18.104.in-addr.arpa",
        "f.2.0.2.2.1.8.6.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.3.1.c.8.9.6.0.a.2.ip6.arpa",
        "1.d.b.9.0.4.c.a.0.0.0.0.0.0.0.0.0.0.0.0.b.0.1.3.1.c.8.9.6.0.a.2.ip6.arpa"
    ])
    const [deviceAccess, setDeviceAccess] = useState<boolean>(false)

    const topDomains: DomainStat[] = useMemo(
        () =>
            data?.top_queried_domains
                ?.map((item: Record<string, number>) => {
                    const [name, count] = Object.entries(item)[0]
                    return { name, count }
                })
                .filter((domain: { name: string }) => !irrelevantDomains.includes(domain.name)) || [],
        [data, irrelevantDomains]
    )

    const topClients: ClientStat[] = useMemo(() => {
        if (!data?.top_clients) return []

        return data.top_clients
            .map((item: Record<string, number>) => {
                const [ip, count] = Object.entries(item)[0]
                const device = devicesData.find((d: any) => d.deviceIp === ip)

                return {
                    ip,
                    count,
                    hostname: device?.deviceHostname || "Unknown",
                    mac: device?.deviceMac || 'Unknown',
                    os: device?.deviceOS
                }
            })
            .filter((d: { ip: string }) => !d.ip.includes("192.168.39.10"))
    }, [data, devicesData])


    const blockedDomains: string[] = useMemo(
        () => data?.top_blocked_domains?.map((item: Record<string, number>) => Object.keys(item)[0]) || [],
        [data]
    )

    const numDNSQueries = data?.num_dns_queries || 0
    const numBlockedSites = blockedDomains.length
    const numBlockedAdultSites = blockedDomains.filter((d) => d.includes("adult")).length
    const [globalFilter, setGlobalFilter] = useState("")

    const openClientModal = async (client: ClientStat) => {
        try {
            const queries = await fetchDeviceQueryLogs(client.ip)

            // const accessList = await getAccessList()

            setClientQueries(queries)
            // setDeviceAccess(accessList.disallowed_clients.includes(client.ip))
        } catch (err) {
            console.error("Failed to fetch client queries or access list:", err)
            setClientQueries([])
            setDeviceAccess(false)
        }

        setSelectedClient(client)
    }

    const domainColumns: ColumnDef<DomainStat>[] = [
        { accessorKey: "name", header: "Domain" },
        { accessorKey: "count", header: "Count" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant={"success"}>Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent >
                        <DropdownMenuItem onClick={() => blockDomain(row.original.name)}>
                            Block for All Devices
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Block ${row.original.name} from a device`)}>
                            Block for a Device
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIrrelevantDomains([...irrelevantDomains, row.original.name])}>
                            Hide
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                <Button size="sm" onClick={() => openClientModal(row.original)}>
                    More Details
                </Button>
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

    // React tables
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

    // Loading / error handling
    if (isLoading) return <div className="p-4">Loading...</div>
    if (isError) return <div className="p-4 text-red-500">Failed to load data</div>

    return (
        <SidebarInset>
            <div className="flex flex-col gap-6 p-4 pt-0">
                {/* Top Stats */}
                <WebFilteringStatsSummary
                    dnsQueries={numDNSQueries}
                    blockedSites={numBlockedSites}
                    blockedAdultSites={numBlockedAdultSites}
                />

                {/* <div className="flex w-full justify-end">
                    <Button size="sm" onClick={() => refetch()}>
                        Refresh
                    </Button>
                </div> */}

                <div className="flex gap-4 flex-row">
                    {/* Top Domains Table */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 w-full overflow-auto">
                        <h2 className="flex justify-center text-lg font-semibold mb-4">Top Domains</h2>
                        {topDomains.length ? (
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


                        ) : (
                            <div className="text-center py-4">No domain data available</div>
                        )}
                    </div>

                    {/* Blocked Domains Table */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 w-full overflow-auto">
                        <h2 className="flex text-lg justify-center font-semibold mb-4">Blocked Domains</h2>
                        {blockedDomains.length ? (
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
                        ) : (
                            <div className="text-center py-4">No blocked sites</div>
                        )}
                    </div>
                </div>

                {/* Top Clients Table */}
                <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 w-full overflow-auto">
                    <h2 className="text-lg font-semibold mb-2">Top Clients</h2>
                    {topClients.length ? (
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
                    ) : (
                        <div className="text-center py-4">No client data available</div>
                    )}
                </div>

                {/* Client Details Modal */}
                {selectedClient && (
                    <Dialog open={true} onOpenChange={() => setSelectedClient(null)}>
                        <DialogContent className="min-w-4xl">
                            <DialogTitle >Device Details</DialogTitle>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 text-sm">
                                <InfoRow icon={<Server />} label="Hostname" value={selectedClient.hostname} />
                                <InfoRow icon={<Globe />} label="IP" value={selectedClient.ip} />
                                <InfoRow icon={<Settings />} label="MAC" value={selectedClient.mac} />
                                <InfoRow icon={<Monitor />} label="OS" value={selectedClient.os} />
                            </div>

                            <div className="flex w-full justify-between">
                                <Button size="sm" onClick={() => fetchDeviceQueryLogs(selectedClient.ip)}>
                                    Refresh Latest
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="success"
                                        onClick={async () => {
                                            await unblockUser(selectedClient.ip)
                                            setDeviceAccess(false)
                                        }}
                                    >
                                        Unblock "{selectedClient.hostname}"
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async () => {
                                            await blockUser(selectedClient.ip)
                                            setDeviceAccess(true)
                                        }}
                                    >
                                        Block "{selectedClient.hostname}"
                                    </Button>
                                </div>

                            </div>

                            <div className="w-full h-96 overflow-auto border border-gray-200 rounded-lg">
                                <Table className="w-full">
                                    <TableHeader>
                                        <TableRow className="text-center">
                                            <TableHead>Time</TableHead>
                                            <TableHead>Domain</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientQueries.map((query, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{query.time}</TableCell>
                                                <TableCell>{query.domain}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm">Actions</Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => alert(`Block ${query.domain}`)}>
                                                                Block this domain
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => alert(`Block ${query.domain} for ${selectedClient.ip}`)}>
                                                                Block this domain for this user only
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => alert(`Block user ${selectedClient.ip}`)}>
                                                                Hide this domain
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => alert(`Block user ${selectedClient.ip}`)}>
                                                                Block this user
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </SidebarInset >
    )
}

export default WebFilteringPage
