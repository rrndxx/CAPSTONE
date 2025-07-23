import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
          <DialogDescription>Adjust preferences and configuration</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <label className="text-sm font-medium">Network Name</label>
            <input
              type="text"
              defaultValue="CRMC MainNet"
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Polling Interval (sec)</label>
            <input
              type="number"
              defaultValue={60}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Enable Email Alerts</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Theme</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
              <option>System</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
