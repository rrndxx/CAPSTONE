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
import { useEffect, useState } from "react"
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
  Cross,
  Check,
  Ban,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { PerDeviceTrafficTable } from "./perdevicetraffictable"
import axios from "axios"

export type Device = {
  deviceId: number
  deviceIp: string
  deviceMac: string
  macInfo: string | null
  deviceHostname: string | null
  deviceOS: string | null
  authorized: boolean
  trustStatus: "WHITELISTED" | "BLACKLISTED" | "NEUTRAL"
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
  devices: initialDevices,
  viewType = "all",
}: {
  devices: Device[]
  viewType?: "whitelist" | "blacklist" | "bandwidth" | "all" | "neutral" | unknown
}) {
  const [devices, setDevices] = useState(initialDevices)
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    setDevices(initialDevices)
  }, [initialDevices])

  const updateDevice = (deviceMac: string, newProps: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.deviceMac === deviceMac
          ? { ...d, ...newProps }
          : d
      )
    )
  }

  const removeFromWhitelist = async (deviceMac: string, interfaceId: number) => {
    try {
      await axios.post("http://localhost:4000/devices/whitelist/remove", { deviceMac, interfaceId })
      updateDevice(deviceMac, { trustStatus: "NEUTRAL" }) // update locally
    } catch (err) {
      console.error(err)
      alert("Error removing from whitelist")
    }
  }

  const removeFromBlacklist = async (deviceMac: string, interfaceId: number) => {
    try {
      await axios.post("http://localhost:4000/devices/blacklist/remove", { deviceMac, interfaceId })
      updateDevice(deviceMac, { trustStatus: "NEUTRAL" }) // update locally
    } catch (err) {
      console.error(err)
      alert("Error removing from blacklist")
    }
  }

  const commonColumns: ColumnDef<Device, any>[] = [
    { accessorKey: "deviceId", header: "ID", cell: info => info.getValue(), meta: { className: 'hidden lg:table-cell' } },
    {
      accessorKey: "deviceHostname",
      header: "Hostname",
      cell: info => (
        <span className="text-primary font-bold uppercase">
          {info.getValue() ?? "—"}
        </span>
      ),
    },
    { accessorKey: "deviceIp", header: "IP", cell: info => info.getValue() },
    { accessorKey: "deviceMac", header: "MAC", cell: info => info.getValue(), meta: { className: 'hidden lg:table-cell' } },
    {
      accessorKey: "deviceOS",
      header: "OS",
      cell: info => info.getValue() ?? "Unknown",
      meta: { className: 'hidden lg:table-cell' }
    },
    {
      accessorKey: "macInfo",
      header: "Vendor",
      cell: info => info.getValue() ?? "—",
      meta: { className: 'hidden lg:table-cell' }
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

      const applyBandwidthRules = async () => {
        throw new Error("Unimplemented");
      }

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

      if (viewType === "whitelist") {
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => removeFromWhitelist(device.deviceMac, device.interfaceId)}
            className="w-32"
          >
            Remove
          </Button>
        )
      }

      if (viewType === "blacklist") {
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => removeFromBlacklist(device.deviceMac, device.interfaceId)}
            className="w-32"
          >
            Remove
          </Button>
        )
      }

      const addToWhitelist = async (deviceMac: string, interfaceId: number) => {
        try {
          await axios.post("http://localhost:4000/devices/whitelist/add", { deviceMac, interfaceId })
          updateDevice(deviceMac, { trustStatus: "WHITELISTED" })
        } catch (err) {
          console.error(err)
        }
      }

      const addToBlacklist = async (deviceMac: string, interfaceId: number) => {
        try {
          await axios.post("http://localhost:4000/devices/blacklist/add", { deviceMac, interfaceId })
          updateDevice(deviceMac, { trustStatus: "BLACKLISTED" })
        } catch (err) {
          console.error(err)
        }
      }

      return (
        <div className="flex items-center justify-center gap-2 min-w-0">
          {device.trustStatus === "WHITELISTED" && (
            <Button
              size="sm"
              variant="success"
              onClick={() => removeFromWhitelist(device.deviceMac, device.interfaceId)}
              className="w-30 rounded-none"
            >
              Remove White
            </Button>
          )}

          {device.trustStatus === "BLACKLISTED" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeFromBlacklist(device.deviceMac, device.interfaceId)}
              className="w-30 rounded-none"
            >
              Remove Black
            </Button>
          )}

          {device.trustStatus === "NEUTRAL" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => addToBlacklist(device.deviceMac, device.interfaceId)}
                className="w-12"
              >
                <Ban />
              </Button>

              <Button
                size="sm"
                variant="success"
                onClick={() => addToWhitelist(device.deviceMac, device.interfaceId)}
                className="w-12"
              >
                <Check />
              </Button>
            </div>
          )}


          {/* Port Scan Result Dialog */}
          <Dialog open={openScanDialog} onOpenChange={setOpenScanDialog}>
            <DialogContent className="max-w-lg sm:max-w-xl overflow-y-auto">
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

        </div>
      )
    },
  }

  let fullColumns: ColumnDef<Device, any>[] = []

  if (viewType === "bandwidth") {
    fullColumns = [
      { accessorKey: "deviceId", header: "ID", cell: info => info.getValue(), meta: { className: "hidden lg:table-cell" }, },
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
          ? { ...col, header: "IP" }
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
        meta: { className: "hidden lg:table-cell" },
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
    <div className="flex flex-col gap-4 min-w-0 bg-card">
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 min-w-0">
        <Input
          placeholder="Search devices..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div> */}

      <div className="w-full rounded-md border overflow-x-auto">
        <Table className="w-full min-h-[150px] table-fixed">
          <TableHeader className="bg-primary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-center whitespace-nowrap px-2 ${header.column.columnDef.meta?.className ?? ""}`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="text-center">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`text-center px-2 truncate max-w-[200px] ${cell.column.columnDef.meta?.className ?? ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={fullColumns.filter(col => !(col.meta?.className?.includes("hidden") ?? false)).length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No devices match the filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>


      <div className="flex justify-between items-center gap-4 flex-wrap">
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
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-md">{label}:</span>
      <span className="truncate text-sm">{value}</span>
    </div>
  )
}
