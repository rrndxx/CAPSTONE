import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DevicesPage = () => {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex gap-4 items-stretch">
          {/* Sidebar Cards */}
          <div className="w-[250px] flex flex-col gap-4">
            {[1, 2, 3].map((card) => (
              <Card key={card} className="flex-1 min-h-[120px]">
                <CardHeader>
                  <CardTitle>Card {card}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Sample</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table Section */}
          <div className="flex-1 bg-white dark:bg-muted/50 rounded-xl shadow p-4">
            <DevicesTable />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}

export default DevicesPage
