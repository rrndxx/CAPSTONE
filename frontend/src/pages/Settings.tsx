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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">System Settings</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manage system behavior and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Network Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Network Configuration</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Network Name</label>
              <input
                type="text"
                defaultValue="CRMC MainNet"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Polling Interval (seconds)</label>
              <input
                type="number"
                defaultValue={60}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Notifications</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Alerts</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Appearance</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
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
