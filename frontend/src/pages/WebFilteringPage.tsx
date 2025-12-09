import React, { useEffect, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoRow } from "@/components/devicestable";
import { Server, Globe, Settings, Monitor, Laptop, GlobeIcon, BarChart, ShieldOff, Shield } from "lucide-react";
import { type ColumnDef, flexRender, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type ClientStat = { ip: string; hostname: string; count: number; os?: string; mac?: string };
type DomainStat = { domain: string; count: number; hostname?: string };
type DNSQuery = { time: number; domain: string };
type Device = { deviceIp: string; deviceHostname: string };
type QueryTypes = Record<string, number>;
type BlockedDomain = { domain: string; count?: number; date_added?: number };

const WebFilteringPage: React.FC = () => {
    const [dnsData, setDnsData] = useState<any>(null);
    const [clientsData, setClientsData] = useState<ClientStat[]>([]);
    const [domainsData, setDomainsData] = useState<DomainStat[]>([]);
    const [blockedDomains, setBlockedDomains] = useState<BlockedDomain[]>([]);
    const [devicesData, setDevicesData] = useState<Device[]>([]);
    const [queryTypes, setQueryTypes] = useState<QueryTypes>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<ClientStat | null>(null);
    const [clientQueries, setClientQueries] = useState<DNSQuery[]>([]);
    const [clientQueriesLoading, setClientQueriesLoading] = useState(false);
    const [blockDomainModalOpen, setBlockDomainModalOpen] = useState(false);
    const [domainToBlock, setDomainToBlock] = useState("");

    // ------------------- FETCH ALL DATA -------------------
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [dnsRes, clientsRes, domainsRes, queryTypesRes, devicesRes, blockedRes] = await Promise.all([
                    fetch("http://localhost:4000/network/dns/all-stats"),
                    fetch("http://localhost:4000/network/dns/top-clients"),
                    fetch("http://localhost:4000/network/dns/top-domains"),
                    fetch("http://localhost:4000/network/dns/query-types"),
                    fetch("http://localhost:4000/devices/all?interfaceId=2"),
                    fetch("http://localhost:4000/network/dns/blocked-domains")
                ]);

                const dnsJson = await dnsRes.json();
                const clientsJson = await clientsRes.json();
                const domainsJson = await domainsRes.json();
                const queryTypesJson = await queryTypesRes.json();
                const devicesJson = await devicesRes.json();
                const blockedJson = await blockedRes.json();

                if (!dnsJson.success) throw new Error("Failed to fetch DNS stats");
                if (!clientsJson.success) throw new Error("Failed to fetch top clients");
                if (!domainsJson.success) throw new Error("Failed to fetch top domains");
                if (!queryTypesJson.success) throw new Error("Failed to fetch query types");
                if (!devicesJson.success) throw new Error("Failed to fetch devices");

                setDnsData(dnsJson.data);

                const devicesArray = Array.isArray(devicesJson.data) ? devicesJson.data : devicesJson.data?.devices || [];
                const devicesList: Device[] = devicesArray.map((d: any) => ({
                    deviceIp: d.deviceIp,
                    deviceHostname: d.deviceHostname || d.deviceIp
                }));
                setDevicesData(devicesList);

                setClientsData(
                    clientsJson.data.clients?.map((c: any) => ({
                        ip: c.ip,
                        hostname: c.name || devicesList.find(d => d.deviceIp === c.ip)?.deviceHostname || c.ip,
                        count: c.count,
                        os: "Unknown",
                        mac: "Unknown"
                    })) || []
                );

                setDomainsData(
                    domainsJson.data.domains?.map((d: any) => ({
                        domain: d.domain,
                        count: d.count,
                        hostname: devicesList.find(dev => dev.deviceIp === d.domain)?.deviceHostname || ""
                    })) || []
                );

                setBlockedDomains(blockedJson.data.domains || []);
                setQueryTypes(queryTypesJson.data.types || {});
            } catch (err: any) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // ------------------- OPEN CLIENT MODAL & FETCH QUERIES -------------------
    const openClientModal = async (client: ClientStat) => {
        setSelectedClient(client);
        setClientQueries([]);
        setClientQueriesLoading(true);

        try {
            const res = await fetch(
                `http://localhost:4000/network/dns/queries?client_ip=${client.ip}&length=100`
            );
            const data = await res.json();

            if (data.success && data.queries?.queries) {
                const queries: DNSQuery[] = data.queries.queries.map((q: any) => ({
                    time: q.time,
                    domain: q.domain
                }));
                setClientQueries(queries);
            } else {
                console.warn("No queries returned for this client");
            }
        } catch (err) {
            console.error("Failed to fetch client queries", err);
        } finally {
            setClientQueriesLoading(false);
        }
    };

    const totalClientQueries = clientsData.reduce((sum, c) => sum + c.count, 0);
    const totalDomainQueries = domainsData.reduce((sum, d) => sum + d.count, 0);

    const getFrequencyColor = (percent: number) => {
        if (percent < 10) return "text-green-600";
        if (percent < 30) return "text-yellow-600";
        return "text-red-600";
    };

    // ------------------- TABLE DEFINITIONS -------------------
    const clientColumns: ColumnDef<ClientStat>[] = [
        {
            accessorKey: "hostname",
            header: "Hostname",
            cell: ({ row }) => <div className="flex items-center gap-2"><Laptop size={16} /><span>{row.original.hostname}</span></div>
        },
        { accessorKey: "count", header: "Queries" },
        {
            id: "frequency",
            header: "Frequency",
            cell: ({ row }) => <span className={getFrequencyColor((row.original.count / totalClientQueries) * 100)}>{((row.original.count / totalClientQueries) * 100).toFixed(1)}%</span>
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => <Button size="sm" className="rounded-none bg-primary" onClick={() => openClientModal(row.original)}>Details</Button>
        }
    ];

    const domainColumns: ColumnDef<DomainStat>[] = [
        {
            accessorKey: "domain",
            header: "Domain",
            cell: ({ row }) => <div className="flex items-center gap-2"><GlobeIcon size={16} /><span>{row.original.domain}</span></div>
        },
        { accessorKey: "count", header: "Queries" },
        {
            id: "frequency",
            header: "Frequency",
            cell: ({ row }) => <span className={getFrequencyColor((row.original.count / totalDomainQueries) * 100)}>{((row.original.count / totalDomainQueries) * 100).toFixed(1)}%</span>
        }
    ];

    const clientTable = useReactTable({ data: clientsData, columns: clientColumns, getCoreRowModel: getCoreRowModel() });
    const domainTable = useReactTable({ data: domainsData, columns: domainColumns, getCoreRowModel: getCoreRowModel() });

    if (loading) return <div className="p-6 text-center text-gray-500">Loading data...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <SidebarInset>
            <div className="flex flex-col gap-6 p-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ icon: <BarChart size={24} />, label: "Total Queries", value: dnsData?.queries?.total || 0 },
                    { icon: <Shield size={24} />, label: "Gravity Blocked", value: dnsData?.gravity?.domains_being_blocked || 0 }].map((card, idx) => (
                        <div key={idx} className="bg-white dark:bg-muted/50 rounded-xl p-4 shadow hover:shadow-md transition flex items-center justify-center gap-3">
                            {card.icon}
                            <div>
                                <div className="text-sm font-medium text-gray-500">{card.label}</div>
                                <div className="text-2xl font-bold">{card.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Top Clients */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Server /> Top Clients</h2>
                        <Table className="w-full">
                            <TableHeader className="bg-primary">
                                {clientTable.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => <TableHead key={header.id} className="text-center">{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {clientTable.getRowModel().rows.map(row => (
                                    <TableRow key={row.id} className="hover:bg-gray-50 transition">
                                        {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="text-center">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Blocked Domains */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2"><ShieldOff /> Blocked Domains</h2>
                            <Button size="sm" variant="destructive" className="rounded-none" onClick={() => setBlockDomainModalOpen(true)}>Add</Button>
                        </div>
                        <Table className="w-full">
                            <TableHeader className="bg-primary">
                                <TableRow>
                                    <TableHead className="text-center">Domain</TableHead>
                                    <TableHead className="text-center">Date Added</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody >
                                {blockedDomains.map((d, idx) => (
                                    <TableRow key={idx} className="hover:bg-gray-50 transition text-center">
                                        <TableCell className="text-center">{d.domain}</TableCell>
                                        <TableCell className="text-center">
                                            {d.date_added ? new Date(d.date_added * 1000).toDateString() : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                className="rounded-none bg-green-700 hover:bg-green-600"
                                                onClick={async () => {
                                                    try {
                                                        const payload = [{ item: d.domain, type: "deny", kind: "exact" }];
                                                        const response = await fetch("http://localhost:4000/network/dns/unblock", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(payload)
                                                        });

                                                        const result = await response.json();
                                                        if (result.success) {
                                                            setBlockedDomains(prev => prev.filter(entry => entry.domain !== d.domain));
                                                        } else {
                                                            alert("Failed to unblock domain: " + (result.message || "Unknown error"));
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Error unblocking domain");
                                                    }
                                                }}
                                            >
                                                Unblock
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Top Domains */}
                    <div className="bg-white dark:bg-muted/50 rounded-xl shadow-sm p-4 overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe /> Top Domains</h2>
                        <Table className="w-full">
                            <TableHeader className="bg-primary">
                                {domainTable.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => <TableHead key={header.id} className="text-center">{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {domainTable.getRowModel().rows.map(row => (
                                    <TableRow key={row.id} className="hover:bg-gray-50 transition">
                                        {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="text-center">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Client Modal */}
                {selectedClient && (
                    <Dialog open={true} onOpenChange={() => setSelectedClient(null)}>
                        <DialogContent className="min-w-4xl">
                            <DialogTitle>Device Details</DialogTitle>
                            <div className="grid grid-cols-1 gap-4 my-2 text-md text-primary">
                                <InfoRow icon={<Server />} label="Hostname" value={selectedClient.hostname} />
                                <InfoRow icon={<Globe />} label="IP" value={selectedClient.ip} />
                            </div>
                            <div className="w-full h-96 overflow-auto border border-gray-200 rounded-lg">
                                <Table className="w-full">
                                    <TableHeader className="bg-primary">
                                        <TableRow className="text-center">
                                            <TableHead>Time</TableHead>
                                            <TableHead>Domain</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientQueriesLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center p-4 text-gray-500">Loading queries...</TableCell>
                                            </TableRow>
                                        ) : clientQueries.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center p-4 text-gray-500">No queries found</TableCell>
                                            </TableRow>
                                        ) : (
                                            clientQueries.map((query, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{new Date(query.time * 1000).toLocaleString()}</TableCell>
                                                    <TableCell>{query.domain}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Block Domain Modal */}
                {blockDomainModalOpen && (
                    <Dialog open={true} onOpenChange={() => setBlockDomainModalOpen(false)}>
                        <DialogContent className="min-w-[400px]">
                            <DialogTitle>Block a Domain</DialogTitle>
                            <div className="flex flex-col gap-4 mt-4">
                                <input
                                    type="text"
                                    placeholder="www.example.com"
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
                                    value={domainToBlock}
                                    onChange={e => setDomainToBlock(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setBlockDomainModalOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={async () => {
                                            if (!domainToBlock.trim()) return;

                                            try {
                                                const payload = {
                                                    domain: [domainToBlock.trim()],
                                                    comment: "",
                                                    type: "deny",
                                                    kind: "exact",
                                                    groups: [0]
                                                };

                                                const response = await fetch("http://localhost:4000/network/dns/block", {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    },
                                                    body: JSON.stringify(payload)
                                                });

                                                const result = await response.json();

                                                if (result.success) {
                                                    setBlockedDomains(prev => [...prev, { domain: domainToBlock.trim() }]);
                                                    setDomainToBlock("");
                                                    setBlockDomainModalOpen(false);
                                                } else {
                                                    alert("Failed to block domain: " + (result.message || "Unknown error"));
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert("Error blocking domain");
                                            }
                                        }}
                                    >
                                        Block
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </SidebarInset>
    );
};

export default WebFilteringPage;
