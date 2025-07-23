import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// import { Switch } from "@/components/ui/switch"
// import { useTheme } from "next-themes"
import { ShieldCheck, Settings, Wifi, User2 } from "lucide-react"

export default function SettingsPage() {
//   const { setTheme } = useTheme()

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your system, user, and network preferences</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <User2 className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account credentials</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input type="email" placeholder="admin@example.com" />
              </div>
              <div>
                <Label>Change Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="mt-2 w-full">Update Profile</Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Settings className="text-primary w-5 h-5" />
              <div>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Personalize your interface</CardDescription>
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

          {/* Network Configuration */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <Wifi className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Network Settings</CardTitle>
                <CardDescription>Control monitoring behavior and access</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 md:flex md:items-end md:gap-6">
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

          {/* Security Options */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <ShieldCheck className="text-primary w-5 h-5" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Extra options to secure your system</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full">Delete Account</Button>
              <p className="text-xs text-muted-foreground text-center">
                This action is irreversible. Make sure you have backups before deleting your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
