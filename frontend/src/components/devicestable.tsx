import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Info,
  Globe,
  Settings,
  Monitor,
  ShieldCheck,
  Server,
  MoreHorizontal,
  Loader2,
  MoreVertical,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { PerDeviceTrafficTable } from "./perdevicetraffictable"

export type Device = {
  deviceId: number
  deviceIp: string
  deviceMac: string
  macInfo: string | null
  deviceHostname: string | null
  deviceOS: string | null
  authorized: boolean
  status: "UP" | "DOWN" | string
  interfaceId: number
  interface: {
    interfaceId: number
    name: string
    identifier: string
    linkType: string
    ipv4: string
    subnet: string
    gateways: string[]
    routes: string[]
    status: boolean
  }
  firstSeen: string
  lastSeen: string
  blocked?: boolean
  ping?: number
  download?: number
  upload?: number
  signal?: number
  bandwidthLimit?: number
}

export function DevicesTable({
  devices,
  viewType = "all",
}: {
  devices: Device[]
  viewType?: "whitelist" | "blacklist" | "bandwidth" | "all"
}) {
  const [globalFilter, setGlobalFilter] = useState("")

  const commonColumns: ColumnDef<Device, any>[] = [
    { accessorKey: "deviceId", header: "ID", cell: info => info.getValue() },
    {
      accessorKey: "deviceHostname",
      header: "Hostname",
      cell: info => info.getValue() ?? "—",
    },
    { accessorKey: "deviceIp", header: "IP", cell: info => info.getValue() },
    { accessorKey: "deviceMac", header: "MAC", cell: info => info.getValue() },
    {
      accessorKey: "deviceOS",
      header: "OS",
      cell: info => info.getValue() ?? "Unknown",
    },
    {
      accessorKey: "macInfo",
      header: "Vendor",
      cell: info => info.getValue() ?? "—",
    },
  ]

  const actionColumn: ColumnDef<Device, any> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const device = row.original
      const [scanResult, setScanResult] = useState<any>(null)
      const [openScanDialog, setOpenScanDialog] = useState(false)
      const [isPortLoading, setIsPortLoading] = useState(false)

      const handleScanPorts = async () => {
        try {
          setIsPortLoading(true)
          const res = await fetch(
            `http://localhost:4000/scan/port?ip=${device.deviceIp}`
          )
          if (!res.ok) throw new Error("Failed to scan ports")
          const data = await res.json()
          setScanResult(data)
          setOpenScanDialog(true)
        } catch (err) {
          console.error(err)
          alert("Error scanning ports")
        } finally {
          setIsPortLoading(false)
        }
      }

      if (viewType === "whitelist" || viewType === "blacklist") {
        const handleRemove = () => {
          const list = viewType === "whitelist" ? "Whitelist" : "Blacklist"
          alert(`Removed ${device.deviceHostname} from ${list}`)
        }
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            className="w-32"
          >
            Remove
          </Button>
        )
      }

      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            // variant="outline"
            onClick={handleScanPorts}
            className="w-28 bg-primary"
          >
            {isPortLoading ? (
              <Loader2 className="animate-spin h-2 w-2" />
            ) : (
              "Scan Ports"
            )}
          </Button>

          {/* Port Scan Result Dialog */}
          <Dialog open={openScanDialog} onOpenChange={setOpenScanDialog}>
            <DialogContent className="max-w-lg sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex justify-center items-center text-lg">
                  Port Scan Result for {device.deviceHostname}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2 text-sm">
                {scanResult ? (
                  Array.isArray(scanResult.open_ports) &&
                    scanResult.open_ports.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-left">
                      {scanResult.open_ports.map(
                        (entry: { port: number; service: string }) => (
                          <li key={entry.port}>
                            Port {entry.port} is open ({entry.service})
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Detected no open ports for this device
                    </p>
                  )
                ) : (
                  <p className="text-muted-foreground">No data</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* View Device Details */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="min-w-[85vw] max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden">
              {/* Sticky header */}
              <DialogHeader className="flex-shrink-0 border-b pb-3 z-10">
                <DialogTitle className="flex justify-center items-center text-xl font-semibold">
                  <span>{device.deviceHostname ?? "Unknown Device"}'s Details</span>
                </DialogTitle>
              </DialogHeader>

              {/* Dashboard body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {/* Device Overview */}
                  <div className="col-span-1 bg-card border rounded-lg p-5 shadow-sm h-full flex flex-col">
                    {/* Header with dropdown */}
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                      <h3 className="text-lg font-semibold">Device Overview</h3>

                      {/* Dropdown block button */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                        {/* Example dropdown (replace with your DropdownMenu component if available) */}
                        {/* 
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Block Device</DropdownMenuItem>
          <DropdownMenuItem>Whitelist</DropdownMenuItem>
          <DropdownMenuItem>Scan Ports</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      */}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-4 flex-1">
                      <InfoRow icon={<Server className="w-5 h-5" />} label="Hostname" value={device.deviceHostname ?? "—"} />
                      <InfoRow icon={<Globe className="w-5 h-5" />} label="IPv4" value={<code>{device.deviceIp}</code>} />
                      <InfoRow icon={<Settings className="w-5 h-5" />} label="MAC" value={<code>{device.deviceMac}</code>} />
                      <InfoRow icon={<Monitor className="w-5 h-5" />} label="OS" value={device.deviceOS ?? "Unknown"} />
                      <InfoRow icon={<ShieldCheck className="w-5 h-5" />} label="Whitelisted" value={device.authorized ? "Yes" : "No"} />
                      <InfoRow icon={<Info className="w-5 h-5" />} label="Last Seen" value={new Date(device.lastSeen).toLocaleTimeString()} />
                    </div>
                  </div>


                  {/* Ports & Security */}
                  <div className="col-span-1 lg:col-span-2 bg-card border rounded-lg p-5 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center border-b">
                      <h3 className="text-lg font-semibold pb-2">Ports & Security</h3>
                      <Button size="sm" onClick={handleScanPorts}>
                        {isPortLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Scan Ports"}
                      </Button>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      <div className="rounded bg-muted/20 p-3 flex-1 flex flex-col">
                        {scanResult ? (
                          scanResult.open_ports?.length > 0 ? (
                            <div className="flex-1 overflow-y-auto">
                              <Table className="text-sm w-full">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-20 text-center">Port</TableHead>
                                    <TableHead className="text-center">Service</TableHead>
                                    <TableHead className="text-center">Severity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {scanResult.open_ports.map((entry: { port: number; service: string }) => {
                                    let severity = "Unknown";
                                    let severityClass = "text-gray-500";

                                    if ([22, 3389].includes(entry.port)) {
                                      severity = "High";
                                      severityClass = "text-red-600 font-semibold";
                                    } else if ([80, 443].includes(entry.port)) {
                                      severity = "Low";
                                      severityClass = "text-green-600 font-medium";
                                    } else if (entry.port < 1024) {
                                      severity = "Medium";
                                      severityClass = "text-yellow-600 font-medium";
                                    } else {
                                      severity = "Low";
                                      severityClass = "text-blue-600";
                                    }

                                    return (
                                      <TableRow key={entry.port}>
                                        <TableCell className="text-center">{entry.port}</TableCell>
                                        <TableCell className="text-center">{entry.service || "—"}</TableCell>
                                        <TableCell className={`text-center ${severityClass}`}>{severity}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-center items-center">
                              <p className="text-muted-foreground">No open ports detected</p>
                            </div>
                          )
                        ) : (
                          <div className="flex-1 flex justify-center items-center">
                            <p className="text-muted-foreground">No scans performed</p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-end font-medium">Last scan: </p>

                    </div>
                  </div>
                </div>

                {/* Network Activity */}
                <div className="col-span-1 lg:col-span-3 bg-card border rounded-lg p-5 shadow-sm mt-6">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Network Activity</h3>
                  <div className="space-y-6">
                    {/* Bandwidth Table */}
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex justify-between items-center">
                        <h2 className="text-md font-medium">Bandwidth Usage</h2>
                        <Button
                          size="sm"
                          onClick={handleScanPorts}
                          className="w-28 bg-primary justify-center items-center self-end"
                        >
                          Apply Rules
                        </Button>
                      </div>
                      <div className="flex justify-center items-center min-h-[130px] bg-muted/20">
                        <PerDeviceTrafficTable viewType="This Device" ipAddress={device.deviceIp} />
                      </div>
                    </div>

                    {/* Recently Visited */}
                    <div>
                      <h2 className="text-md font-medium">Visited Sites</h2>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-[120px] overflow-y-auto">
                        <li>example.com</li>
                        <li>openai.com</li>
                        <li>github.com</li>
                        <li className="italic">+ More</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div >
      )
    },
  }

  let fullColumns: ColumnDef<Device, any>[] = []

  if (viewType === "bandwidth") {
    fullColumns = [
      { accessorKey: "deviceId", header: "ID", cell: info => info.getValue() },
      {
        accessorKey: "deviceHostname",
        header: "Hostname",
        cell: info => info.getValue() ?? "—",
      },
      { accessorKey: "deviceIp", header: "IP", cell: info => info.getValue() },
      {
        accessorKey: "download",
        header: "Download",
        cell: info => `${info.getValue() ?? 0} Mbps`,
      },
      {
        accessorKey: "upload",
        header: "Upload",
        cell: info => `${info.getValue() ?? 0} Mbps`,
      },
      {
        accessorKey: "bandwidthLimit",
        header: "Limit",
        cell: info => `${info.getValue() ?? "0"} Mbps`,
      },
      actionColumn,
    ]
  } else {
    fullColumns = [...commonColumns]

    if (viewType === "all") {
      fullColumns = fullColumns.map(col =>
        (col as any).accessorKey === "deviceIp"
          ? { ...col, header: "IPv4" }
          : col
      )

      fullColumns.push({
        accessorKey: "status",
        header: "Status",
        cell: info => {
          const inf = info.getValue() as string
          const value = inf === "UP" ? "ONLINE" : "OFFLINE"
          const color = value === "ONLINE" ? "text-green-600" : "text-red-500"
          return <span className={`font-medium ${color}`}>{value}</span>
        },
      })

      fullColumns.push({
        accessorKey: "interfaceName",
        header: "Interface",
        cell: ({ row }) => row.original.interface?.name ?? "—",
      })
    }

    fullColumns.push(actionColumn)
  }

  const table = useReactTable({
    data: devices ?? [],
    columns: fullColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Input
          placeholder="Search devices..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table className="w-full min-h-[150px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody className="min-h-[200px]">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="text-center">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={fullColumns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No devices match the filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center gap-4">
        <div></div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="w-10 h-10 px-0"
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="w-10 h-10 px-0"
          >
            {"<"}
          </Button>
          <div className="text-sm text-muted-foreground text-right px-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-10 h-10 px-0"
          >
            {">"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="w-10 h-10 px-0"
          >
            {">>"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          Rows per page
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: any
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-md">{label}:</span>
      <span className="truncate text-sm">{value}</span>
    </div>
  )
}
