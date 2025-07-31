import { SidebarInset } from "@/components/ui/sidebar"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// import { Switch } from "@/components/ui/switch"
// import { useTheme } from "next-themes"
import {
  ShieldCheck, Settings, Wifi, User2, Bell, DatabaseBackup, Wrench
} from "lucide-react"

export default function SettingsPage() {
  // const { setTheme } = useTheme()

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <p className="text-muted-foreground">Manage your system and user preferences efficiently</p>

        <div className="grid gap-6 md:grid-cols-2">

          {/* User Profile */}
          <Card>
            <CardHeader className="flex gap-3 items-center">
              <User2 className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your admin account</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="admin@example.com" />
              </div>
              <div>
                <Label>Change Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full">Update Profile</Button>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card>
            <CardHeader className="flex gap-3 items-center">
              <Settings className="text-primary w-5 h-5" />
              <div>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Customize interface and behavior</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Dark Mode</Label>
                {/* <Switch onCheckedChange={(val) => setTheme(val ? "dark" : "light")} /> */}
              </div>
              <div>
                <Label>Language</Label>
                <Input placeholder="English" disabled />
              </div>
            </CardContent>
          </Card>

          {/* Network Settings */}
          <Card className="md:col-span-2">
            <CardHeader className="flex gap-3 items-center">
              <Wifi className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Network Settings</CardTitle>
                <CardDescription>Configure scanning and API access</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="md:flex md:gap-6 md:items-end space-y-4 md:space-y-0">
              <div className="flex-1">
                <Label>Polling Interval (sec)</Label>
                <Input type="number" defaultValue={60} />
              </div>
              <div className="flex-1">
                <Label>Sophos API Key</Label>
                <Input type="password" placeholder="••••••••••••" />
              </div>
              <Button>Save Network Settings</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="md:col-span-2">
            <CardHeader className="flex gap-3 items-center">
              <Bell className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Set how alerts are delivered</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Notifications</Label>
                <Input type="email" placeholder="alerts@school.edu" />
              </div>
              <div>
                <Label>Threshold Alert (MB/s)</Label>
                <Input type="number" defaultValue={100} />
              </div>
              <Button>Update Notification Settings</Button>
            </CardContent>
          </Card>

          {/* Backup & Restore */}
          <Card>
            <CardHeader className="flex gap-3 items-center">
              <DatabaseBackup className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Safeguard your data</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Download Backup</Button>
              <Button className="w-full" variant="secondary">Restore from File</Button>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card>
            <CardHeader className="flex gap-3 items-center">
              <Wrench className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Admin tools for system health</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">Clear Cache</Button>
              <Button className="w-full" variant="outline">Restart Backend</Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="md:col-span-2">
            <CardHeader className="flex gap-3 items-center">
              <ShieldCheck className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your system and data</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full">Delete Account</Button>
              <p className="text-xs text-muted-foreground text-center">
                This action is irreversible. Ensure backups are stored safely.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
