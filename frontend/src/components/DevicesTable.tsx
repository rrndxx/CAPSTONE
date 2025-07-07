import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "./ui/button"

const devices = [
  {
    id: '1',
    hostname: 'laptop-home',
    ip: '192.168.1.2',
    mac: '00:1B:44:11:3A:B7',
    type: 'Laptop',
  },
  {
    id: '2',
    hostname: 'phone-john',
    ip: '192.168.1.3',
    mac: '00:1B:44:11:3A:B8',
    type: 'Smartphone',
  },
  {
    id: '3',
    hostname: 'workstation-office',
    ip: '192.168.1.10',
    mac: '00:1B:44:11:3A:B9',
    type: 'Desktop',
  },
  {
    id: '4',
    hostname: 'printer-hp',
    ip: '192.168.1.20',
    mac: '00:1B:44:11:3A:BA',
    type: 'Printer',
  },
  {
    id: '5',
    hostname: 'tablet-guest',
    ip: '192.168.1.5',
    mac: '00:1B:44:11:3A:BB',
    type: 'Tablet',
  },
]

export function DevicesTable() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader >
        <TableRow>
          <TableHead className="text-center">UID</TableHead>
          <TableHead className="text-center">Hostname</TableHead>
          <TableHead className="text-center">IPv4 Address</TableHead>
          <TableHead className="text-center">MAC Address</TableHead>
          <TableHead className="text-center">Device Type</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-center">
        {devices.map((device) => (
          <TableRow key={device.id}>
            <TableCell className="font-medium">{device.id}</TableCell>
            <TableCell>{device.hostname}</TableCell>
            <TableCell>{device.ip}</TableCell>
            <TableCell>{device.mac}</TableCell>
            <TableCell>{device.type}</TableCell>
            <TableCell className="flex justify-center gap-2">
              <Button className="bg-chart-2" title="Device Details"> Details</Button>
              <Button className="bg-destructive">Block</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
