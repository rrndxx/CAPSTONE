import { ScrollArea } from "@/components/ui/scroll-area"
import { LogIn, Lock, AlertCircle, Check } from "lucide-react"
import { Button } from "./ui/button"

const auditData = [
  {
    id: 1,
    // admin: "Alice",
    action: "Logged in",
    time: "10:02 AM",
    icon: <LogIn className="w-4 h-4 text-chart-2" />,
  },
  {
    id: 2,
    // admin: "Bob",
    action: "Limit bandwidth",
    time: "9:45 AM",
    icon: <AlertCircle className="w-4 h-4 text-destructive" />,
  },
  {
    id: 3,
    // admin: "Alice",
    action: "Blocked a device",
    time: "9:30 AM",
    icon: <Lock className="w-4 h-4 text-destructive" />,
  },
  {
    id: 4,
    // admin: "Alice",
    action: "Authorized a device",
    time: "9:30 AM",
    icon: <Check className="w-4 h-4 text-chart-2" />,
  }
]

export default function AuditTrailCard() {
  return (
    <div className="flex flex-col justify-between flex-1">
      <ScrollArea className="flex-1 pr-2 [&_.scroll-area-viewport]:scroll-hide">
        <ul className="space-y-4">
          {auditData.map((log) => (
            <li
              key={log.id}
              className="flex justify-between items-center text-sm border-b border-muted pb-2"
            >
              <div className="flex items-center gap-2">
                {log.icon}
                <div className="flex flex-col">
                  <span className="text-sm">
                    {log.action}
                  </span>
                </div>
              </div>
              <span className="text-xxxs text-muted-foreground">{log.time}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <Button size="sm" className="mt-4 self-end lg:self-center font-medium px-4 bg-chart-2">
        View All Actions
      </Button>
    </div>
  )
}
