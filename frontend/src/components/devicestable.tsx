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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

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
  bandwidthLimit: number
  authorized: boolean
  blocked: boolean
}

// const columns: ColumnDef<Device>[] = [
//   { accessorKey: "uid", header: "UID", cell: info => info.getValue() },
//   { accessorKey: "ip", header: "IP", cell: info => info.getValue() },
//   { accessorKey: "mac", header: "MAC", cell: info => info.getValue() },
//   { accessorKey: "hostname", header: "Hostname", cell: info => info.getValue() },
//   { accessorKey: "type", header: "Type", cell: info => info.getValue() },
//   { accessorKey: "os", header: "OS", cell: info => info.getValue() },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: (info) => {
//       const value = info.getValue() as string
//       const color = value === "Online" ? "text-green-600" : "text-red-500"
//       return <span className={`font-medium ${color}`}>{value}</span>
//     },
//   },
//   {
//     id: "actions",
//     header: "Actions",
//     cell: ({ row }) => {
//       const device = row.original
//       const [bandwidth, setBandwidth] = useState("")

//       const handleLimit = () => {
//         if (!bandwidth || Number(bandwidth) <= 0) {
//           alert("Enter a valid bandwidth limit.")
//           return
//         }
//         alert(`Bandwidth limit of ${bandwidth} Mbps applied to ${device.hostname}`)
//       }

//       const handleToggleBlock = () => {
//         const action = device.blocked ? "Unblocked" : "Blocked"
//         alert(`${action} ${device.hostname}`)
//       }

//       return (
//         <div className="flex items-center justify-center gap-2">
//           {/* Block / Unblock Button */}
//           <Button
//             size="sm"
//             variant={device.blocked ? "success" : "destructive"}
//             onClick={handleToggleBlock}
//             className="w-24"
//           >
//             {device.blocked ? "Unblock" : "Block"}
//           </Button>

//           {/* Dialog Trigger */}
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button
//                 size="icon"
//                 variant="outline"
//                 className="w-8 h-8"
//               >
//                 <MoreHorizontal className="w-4 h-4" />
//               </Button>
//             </DialogTrigger>

//             <DialogContent className="max-w-lg sm:max-w-xl">
//               <DialogHeader>
//                 <DialogTitle className="flex items-center gap-2 text-lg">
//                   <Info className="w-5 h-5" />
//                   Device Details
//                 </DialogTitle>
//                 <DialogDescription className="text-sm text-muted-foreground">
//                   Manage <strong>{device.name}</strong> and view technical details.
//                 </DialogDescription>
//               </DialogHeader>

//               {/* Device Info Grid */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
//                 <InfoRow icon={<Server />} label="Hostname" value={device.hostname} />
//                 <InfoRow icon={<Globe />} label="IP" value={device.ip} />
//                 <InfoRow icon={<Settings />} label="MAC" value={device.mac} />
//                 <InfoRow icon={<Laptop2 />} label="Type" value={device.type} />
//                 <InfoRow icon={<Monitor />} label="OS" value={device.os} />
//                 <InfoRow icon={<Gauge />} label="Ping" value={`${device.ping} ms`} />
//                 <InfoRow icon={<Download />} label="Download" value={`${device.download} Mbps`} />
//                 <InfoRow icon={<Upload />} label="Upload" value={`${device.upload} Mbps`} />
//                 <InfoRow icon={<Wifi />} label="Signal" value={`${device.signal}%`} />
//                 <InfoRow icon={<ShieldCheck />} label="Authorized" value={device.authorized ? "Yes" : "No"} />
//                 <InfoRow icon={<Ban />} label="Blocked" value={device.blocked ? "Yes" : "No"} />
//               </div>

//               {/* Bandwidth Control */}
//               <div className="mt-6 space-y-2">
//                 <p className="text-sm font-medium">Limit Bandwidth</p>
//                 <div className="flex flex-col sm:flex-row items-center gap-2">
//                   <Input
//                     placeholder="Enter Mbps"
//                     type="number"
//                     value={bandwidth}
//                     onChange={(e) => setBandwidth(e.target.value)}
//                   />
//                   <Button size="sm" onClick={handleLimit}>
//                     Apply
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div >
//       )
//     }
//   }
// ]

export function DevicesTable({
  devices,
  viewType = "all",
}: {
  devices: Device[]
  viewType?: "whitelist" | "blacklist" | "bandwidth" | "all"
}) {
  const [globalFilter, setGlobalFilter] = useState("")

  const commonColumns: ColumnDef<Device>[] = [
    { accessorKey: "uid", header: "UID", cell: info => info.getValue() },
    { accessorKey: "ip", header: "IP", cell: info => info.getValue() },
    { accessorKey: "mac", header: "MAC", cell: info => info.getValue() },
    { accessorKey: "hostname", header: "Hostname", cell: info => info.getValue() },
    { accessorKey: "type", header: "Type", cell: info => info.getValue() },
    { accessorKey: "os", header: "OS", cell: info => info.getValue() },
  ]

  const actionColumn: ColumnDef<Device> = {
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

      if (viewType === "bandwidth") {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="w-24"
              >
                Limit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Gauge className="w-5 h-5" />
                  Limit Bandwidth
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Set a bandwidth limit for <strong>{device.hostname}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Bandwidth (in Mbps)</p>
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
        )
      }

      const handleToggleBlock = () => {
        const action = device.blocked ? "Unblocked" : "Blocked"
        alert(`${action} ${device.hostname}`)
      }

      const handleRemove = () => {
        const list = viewType === "whitelist" ? "Whitelist" : "Blacklist"
        alert(`Removed ${device.hostname} from ${list}`)
      }

      if (viewType === "whitelist" || viewType === "blacklist") {
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
            variant={device.blocked ? "success" : "destructive"}
            onClick={handleToggleBlock}
            className="w-24"
          >
            {device.blocked ? "Unblock" : "Block"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="w-8 h-8">
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
        </div>
      )
    }
  }

  let fullColumns: ColumnDef<Device>[] = []

  if (viewType === "bandwidth") {
    fullColumns = [
      { accessorKey: "uid", header: "UID", cell: info => info.getValue() },
      { accessorKey: "hostname", header: "Hostname", cell: info => info.getValue() },
      { accessorKey: "ip", header: "IP", cell: info => info.getValue() },
      {
        accessorKey: "download",
        header: "Download",
        cell: info => `${info.getValue()} Mbps`,
      },
      {
        accessorKey: "upload",
        header: "Upload",
        cell: info => `${info.getValue()} Mbps`,
      },
      {
        accessorKey: "bandwidthLimit",
        header: "Limit",
        cell: info => `${info.getValue() ?? "0"} mb`,
      },
      actionColumn,
    ]
  } else {
    fullColumns = [...commonColumns]
    if (viewType === "all") {
      fullColumns.push({
        accessorKey: "status",
        header: "Status",
        cell: info => {
          const value = info.getValue() as string
          const color = value === "Online" ? "text-green-600" : "text-red-500"
          return <span className={`font-medium ${color}`}>{value}</span>
        }
      })
    }
    fullColumns.push(actionColumn)
  }

  const table = useReactTable({
    data: devices ?? [],
    columns: fullColumns,
    state: {
      globalFilter,
      // pagination: {
      //   pageIndex: 0,
      //   pageSize: 10,
      // }
    },
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
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
