import { DevicesTable } from "@/components/devicestable"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DevicesPage = () => {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Cards section - now above the table and responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((card) => (
            <Card key={card} className="min-h-[150px]">
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
        <div className="bg-white dark:bg-muted/50 rounded-xl shadow p-4">
          <DevicesTable />
        </div>
      </div>
    </SidebarInset>
  )
}

export default DevicesPage
