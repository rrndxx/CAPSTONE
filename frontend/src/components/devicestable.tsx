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
  DialogDescription,
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
  Laptop2,
  Monitor,
  Gauge,
  Download,
  Upload,
  Wifi,
  ShieldCheck,
  Ban,
  Server,
  MoreHorizontal,
} from "lucide-react"

export type Device = {
  uid: number
  hostname: string
  name: string
  ip: string
  mac: string
  type: string
  os: string
  status: string
  signal: number
  download: number
  upload: number
  ping: number
  authorized: boolean
  blocked: boolean
}

const columns: ColumnDef<Device>[] = [
  { accessorKey: "uid", header: "UID", cell: info => info.getValue() },
  { accessorKey: "ip", header: "IP", cell: info => info.getValue() },
  { accessorKey: "mac", header: "MAC", cell: info => info.getValue() },
  { accessorKey: "hostname", header: "Hostname", cell: info => info.getValue() },
  { accessorKey: "type", header: "Type", cell: info => info.getValue() },
  { accessorKey: "os", header: "OS", cell: info => info.getValue() },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const value = info.getValue() as string
      const color = value === "Online" ? "text-green-600" : "text-red-500"
      return <span className={`font-medium ${color}`}>{value}</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const device = row.original
      const [bandwidth, setBandwidth] = useState("")

      const handleLimit = () => {
        if (!bandwidth || Number(bandwidth) <= 0) {
          alert("Enter a valid bandwidth limit.")
          return
        }
        alert(`Bandwidth limit of ${bandwidth} Mbps applied to ${device.hostname}`)
      }

      const handleToggleBlock = () => {
        const action = device.blocked ? "Unblocked" : "Blocked"
        alert(`${action} ${device.hostname}`)
      }

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Block / Unblock Button */}
          <Button
            size="sm"
            variant={device.blocked ? "success" : "destructive"}
            onClick={handleToggleBlock}
            className="w-24"
          >
            {device.blocked ? "Unblock" : "Block"}
          </Button>

          {/* Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5" />
                  Device Details
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Manage <strong>{device.name}</strong> and view technical details.
                </DialogDescription>
              </DialogHeader>

              {/* Device Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                <InfoRow icon={<Server />} label="Hostname" value={device.hostname} />
                <InfoRow icon={<Globe />} label="IP" value={device.ip} />
                <InfoRow icon={<Settings />} label="MAC" value={device.mac} />
                <InfoRow icon={<Laptop2 />} label="Type" value={device.type} />
                <InfoRow icon={<Monitor />} label="OS" value={device.os} />
                <InfoRow icon={<Gauge />} label="Ping" value={`${device.ping} ms`} />
                <InfoRow icon={<Download />} label="Download" value={`${device.download} Mbps`} />
                <InfoRow icon={<Upload />} label="Upload" value={`${device.upload} Mbps`} />
                <InfoRow icon={<Wifi />} label="Signal" value={`${device.signal}%`} />
                <InfoRow icon={<ShieldCheck />} label="Authorized" value={device.authorized ? "Yes" : "No"} />
                <InfoRow icon={<Ban />} label="Blocked" value={device.blocked ? "Yes" : "No"} />
              </div>

              {/* Bandwidth Control */}
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Limit Bandwidth</p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Input
                    placeholder="Enter Mbps"
                    type="number"
                    value={bandwidth}
                    onChange={(e) => setBandwidth(e.target.value)}
                  />
                  <Button size="sm" onClick={handleLimit}>
                    Apply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div >
      )
    }
  }
]

export function DevicesTable({ devices }: { devices: Device[] }) {
  const [globalFilter, setGlobalFilter] = useState("")


  const table = useReactTable({
    data: devices ?? [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="text-center">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-muted-foreground text-right">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}:</span>
      <span className="truncate text-sm text-primary">{value}</span>
    </div>
  )
}
