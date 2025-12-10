"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatabaseBackup } from "lucide-react"

const REPORTS = [
  { label: "Device", value: "Device" },
  { label: "Alerts", value: "Alert" },
  { label: "Network Interfaces", value: "NetworkInterface" },
  { label: "Blocked Sites", value: "BlockedSite" },
  { label: "Whitelisted Devices", value: "WhitelistedDevice" },
]

const FORMATS = [
  { label: "PDF", value: "pdf" },
  { label: "CSV", value: "csv" },
]

// Flatten nested objects for table display
const flattenRow = (row: Record<string, any>) => {
  const flatRow: Record<string, any> = {}
  Object.entries(row).forEach(([key, val]) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.entries(val).forEach(([nestedKey, nestedVal]) => {
        flatRow[`${key}.${nestedKey}`] = nestedVal
      })
    } else {
      flatRow[key] = val
    }
  })
  return flatRow
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>(REPORTS[0].value)
  const [selectedFormat, setSelectedFormat] = useState<string>(FORMATS[0].value)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [previewData, setPreviewData] = useState<Array<Record<string, any>>>([])
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchLastUpdated = async () => {
      setLastUpdated(new Date().toLocaleString())
    }

    const fetchPreviewData = async () => {
      setLoadingPreview(true)
      setError("")
      try {
        const res = await fetch(`http://localhost:4000/reports/preview/${selectedReport}`)
        if (!res.ok) throw new Error("Failed to fetch preview")
        const data = await res.json()
        setPreviewData(data)
      } catch (err: any) {
        setError(err.message || "Error fetching preview")
        setPreviewData([])
      } finally {
        setLoadingPreview(false)
      }
    }

    fetchLastUpdated()
    fetchPreviewData()
  }, [selectedReport])

  const flattenedData = previewData.map(flattenRow)
  const isDownloadDisabled = !selectedReport || !selectedFormat
  const getDownloadUrl = (reportType: string, format: string) =>
    `http://localhost:4000/reports/${reportType}/${format}`

  return (
    <SidebarInset>
      <div className="flex flex-col gap-10 p-6 md:p-10 max-w-7xl mx-auto">
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <DatabaseBackup className="text-primary w-8 h-8" />
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Export Reports
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Download database tables in PDF or CSV format. Preview data below before downloading.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-8">
            {/* Report & Format Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reportSelect" className="font-medium text-sm">Select Report</label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger id="reportSelect" className="w-full">
                    <SelectValue placeholder="Select report" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORTS.map((report) => (
                      <SelectItem key={report.value} value={report.value}>
                        {report.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="formatSelect" className="font-medium text-sm">Select Format</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger id="formatSelect" className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-gray-500 text-sm">
                Last updated: <span className="font-medium">{lastUpdated}</span>
              </p>
            )}

            {/* Live Preview Table */}
            {loadingPreview && <p className="text-gray-500 text-sm">Loading preview...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {!loadingPreview && flattenedData.length > 0 && (
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-sm border-collapse ">
                  <thead className="bg-primary">
                    <tr>
                      {Object.keys(flattenedData[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left border-b font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flattenedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-3 py-2 border-b">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Download Button */}
            <a
              href={getDownloadUrl(selectedReport, selectedFormat)}
              download={`${selectedReport}.${selectedFormat}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full" disabled={isDownloadDisabled}>
                {isDownloadDisabled ? "Select Report & Format" : "Download Report"}
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
