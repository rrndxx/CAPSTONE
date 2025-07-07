import { DevicesTable } from "@/components/DevicesTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DevicesPage = () => {
  return (
    <div className="flex flex-col p-4">
      <div className="flex w-full items-center justify-between pb-8 pt-2">
        <Input type="search" className="w-78" placeholder="Search for a device..." />
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button className="bg-chart-2 font-normal">Add a Device</Button>
            <Button className="bg-destructive font-normal">Block a Device</Button>
          </div>
        </div>
      </div>
      <DevicesTable />
    </div>
  )
}

export default DevicesPage