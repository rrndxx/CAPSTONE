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
  DialogFooter,
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

type Device = {
  uid: number
  ip: string
  mac: string
  hostname: string
  type: string
  os: string
}

const devices: Device[] = [
  { uid: 1, ip: "192.168.1.2", mac: "00:1A:2B:3C:4D:5E", hostname: "desktop-001", type: "Desktop", os: "Windows 10" },
  { uid: 2, ip: "192.168.1.3", mac: "00:1A:2B:3C:4D:5F", hostname: "laptop-123", type: "Laptop", os: "Ubuntu 22.04" },
  { uid: 3, ip: "192.168.1.4", mac: "00:1A:2B:3C:4D:60", hostname: "printer-office", type: "Printer", os: "Embedded OS" },
  { uid: 4, ip: "192.168.1.5", mac: "00:1A:2B:3C:4D:61", hostname: "raspberrypi", type: "IoT", os: "Raspberry Pi OS" },
  { uid: 5, ip: "192.168.1.6", mac: "00:1A:2B:3C:4D:62", hostname: "server-01", type: "Server", os: "Windows Server 2019" },
]

const columns: ColumnDef<Device>[] = [
  { accessorKey: "uid", header: "UID" },
  { accessorKey: "ip", header: "IP Address" },
  { accessorKey: "mac", header: "MAC Address" },
  { accessorKey: "hostname", header: "Hostname" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "os", header: "OS" },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const device = row.original

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">...</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Device Actions</DialogTitle>
              <DialogDescription>
                Actions for <span className="font-semibold">{device.hostname}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <p><strong>IP:</strong> {device.ip}</p>
              <p><strong>MAC:</strong> {device.mac}</p>
              <p><strong>Type:</strong> {device.type}</p>
              <p><strong>OS:</strong> {device.os}</p>
            </div>

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="destructive" onClick={() => alert(`Blocked ${device.hostname}`)}>
                Block
              </Button>
              <Button variant="secondary">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }
  }
]

export function DevicesTable() {
  const [globalFilter, setGlobalFilter] = useState("")
  const table = useReactTable({
    data: devices,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
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
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
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
