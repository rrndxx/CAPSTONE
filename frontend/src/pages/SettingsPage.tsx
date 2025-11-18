"use client"

import { useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User2, DatabaseBackup } from "lucide-react"

const REPORTS = [
  { label: "Device", value: "Device" },
  { label: "Bandwidth Usage", value: "BandwidthUsage" },
  { label: "Hourly Bandwidth", value: "BandwidthHourly" },
  { label: "Daily Bandwidth", value: "BandwidthDaily" },
  { label: "Alerts", value: "Alert" },
  { label: "Users", value: "User" },
  { label: "Network Interfaces", value: "NetworkInterface" },
  { label: "Ports", value: "Port" },
  { label: "Visited Sites", value: "VisitedSite" },
  { label: "Blocked Sites", value: "BlockedSite" },
  { label: "Whitelisted Devices", value: "WhitelistedDevice" },
  { label: "Blacklisted Devices", value: "BlacklistedDevice" },
]

const FORMATS = [
  { label: "PDF", value: "pdf" },
  { label: "CSV", value: "csv" },
]

export default function SettingsPage() {
  const [selectedReport, setSelectedReport] = useState<string>(REPORTS[0].value)
  const [selectedFormat, setSelectedFormat] = useState<string>(FORMATS[0].value)

  const getDownloadUrl = (reportType: string, format: string) => {
    return `http://localhost:4000/reports/${reportType}/${format}`
  }

  return (
    <SidebarInset>
      <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your system and user preferences efficiently
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Profile Settings */}
          <Card className="w-full">
            <CardHeader className="flex items-center gap-3">
              <User2 className="text-primary w-5 h-5" />
              <div>
                <CardTitle className="text-base sm:text-lg">Profile Settings</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage your admin account
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="password">Change Password</Label>
                <Input id="password" type="password" placeholder="Enter new password" className="w-full" />
              </div>
              <Button className="w-full">Update Profile</Button>
            </CardContent>
          </Card>

          {/* Download Your Data */}
          <Card className="w-full">
            <CardHeader className="flex items-center gap-3">
              <DatabaseBackup className="text-primary w-5 h-5" />
              <div>
                <CardTitle className="text-base sm:text-lg">Download Your Data</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Export database tables as PDF or CSV
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="reportSelect">Select Table</Label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger id="reportSelect" className="w-full">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORTS.map(report => (
                        <SelectItem key={report.value} value={report.value}>
                          {report.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="formatSelect">Select Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger id="formatSelect" className="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <a
                href={getDownloadUrl(selectedReport, selectedFormat)}
                download={`${selectedReport}.${selectedFormat}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full">Download</Button>
              </a>
            </CardContent>
          </Card>

        </div>
      </div>
    </SidebarInset>
  )
}
