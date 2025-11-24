import { useState, useEffect } from "react"
import { Wifi, CheckCircle2, XCircle, Globe, AlertTriangle, Upload, Download, Cpu, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

type StatusType = "online" | "degraded" | "offline"

interface Outage {
    name: string
    category: "ISP" | "Service"
    url: string
    colorClass: string
}

interface SpeedInfo {
    isp: string
    client_ip: string
    server_name: string
    latency: string
    ping_ms: string
    upload: string
    download: string
    timestamp: string
}

const ISPStatusPage = () => {
    const [status, setStatus] = useState<StatusType>("online")
    const [speedData, setSpeedData] = useState<SpeedInfo | null>(null)
    const [history, setHistory] = useState<{ timestamp: string; upload: number; download: number }[]>([])
    const [outages, setOutages] = useState<Outage[]>([])

    /* ------------------------------------------ */
    /* LOAD LAST SPEEDTEST FROM LOCALSTORAGE */
    /* ------------------------------------------ */
    useEffect(() => {
        const saved = localStorage.getItem("lastSpeedTest")
        if (saved) {
            try {
                const parsed: SpeedInfo = JSON.parse(saved)
                setSpeedData(parsed)
                const download = Number(parsed.download)
                if (download >= 50) setStatus("online")
                else if (download >= 10) setStatus("degraded")
                else setStatus("offline")
                setHistory([{ timestamp: parsed.timestamp, upload: Number(parsed.upload), download: Number(parsed.download) }])
            } catch {
                console.error("Failed to parse lastSpeedTest")
            }
        }

        // Listen for localStorage changes (from speed test dialog)
        const onStorage = (e: StorageEvent) => {
            if (e.key === "lastSpeedTest" && e.newValue) {
                try {
                    const parsed: SpeedInfo = JSON.parse(e.newValue)
                    setSpeedData(parsed)
                    const download = Number(parsed.download)
                    if (download >= 50) setStatus("online")
                    else if (download >= 10) setStatus("degraded")
                    else setStatus("offline")

                    // Append to history, keep last 10
                    setHistory(prev => {
                        const newHist = [...prev, { timestamp: parsed.timestamp, upload: Number(parsed.upload), download: Number(parsed.download) }]
                        return newHist.slice(-10)
                    })
                } catch { }
            }
        }
        window.addEventListener("storage", onStorage)
        return () => window.removeEventListener("storage", onStorage)
    }, [])

    /* ------------------------------------------ */
    /* POPULAR OUTAGES */
    /* ------------------------------------------ */
    useEffect(() => {
        setOutages([
            { name: "PLDT", category: "ISP", url: "https://downdetector.ph/status/pldt/", colorClass: "bg-white text-[#ED1C24]" },
            { name: "Dito", category: "ISP", url: "https://downdetector.ph/status/dito/", colorClass: "bg-white text-[#ED1C24]" },
            { name: "Converge", category: "ISP", url: "https://downdetector.ph/status/converge/", colorClass: "bg-white text-[#12918e]" },
            { name: "Globe", category: "ISP", url: "https://downdetector.ph/status/globe/", colorClass: "bg-[#0066CC] text-white" },
            { name: "Smart", category: "ISP", url: "https://downdetector.ph/status/smart/", colorClass: "bg-gradient-to-r from-[#00B140] to-[#FFD600] text-white" },
            { name: "TNT", category: "ISP", url: "https://downdetector.ph/status/tnt/", colorClass: "bg-gradient-to-r from-[#FFA500] via-[#FFD600] to-[#FFA500] text-white" },
            { name: "Facebook", category: "Service", url: "https://downdetector.ph/status/facebook/", colorClass: "bg-[#1877F2] text-white" },
            { name: "YouTube", category: "Service", url: "https://downdetector.ph/status/youtube/", colorClass: "bg-[#FF0000] text-white" },
            { name: "TikTok", category: "Service", url: "https://downdetector.ph/status/tiktok/", colorClass: "bg-black text-white" },
            { name: "Netflix", category: "Service", url: "https://downdetector.ph/status/netflix/", colorClass: "bg-[#E50914] text-white" },
            { name: "Instagram", category: "Service", url: "https://downdetector.ph/status/instagram/", colorClass: "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white" },
        ])
    }, [])

    const badge = getStatusBadge(status)

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            {/* ISP Overview */}
            <Card className="shadow-lg hover:shadow-xl transition-all rounded-xl">
                <CardHeader className="py-4 bg-primary">
                    <CardTitle className="flex items-center gap-2 text-black font-medium uppercase tracking-wide">
                        <Wifi className="w-5 h-5 text-black" />
                        ISP Status
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    <div className="flex justify-between items-center flex-wrap">
                        <div>
                            <p className="text-xs text-gray-400">Provider</p>
                            <p className="text-lg font-semibold">{speedData?.isp ?? "Unknown"}</p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color} shadow-sm`}>
                            {badge.icon}
                            {badge.label}
                        </div>
                    </div>

                    {/* Metrics with icons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <Metric icon={<Globe className="w-4 h-4 text-gray-500" />} label="Client IP" value={speedData?.client_ip ?? "--"} />
                        <Metric icon={<Globe className="w-4 h-4 text-gray-500" />} label="Server" value={speedData?.server_name ?? "--"} />
                        <Metric icon={<Cpu className="w-4 h-4 text-gray-500" />} label="Latency" value={`${speedData?.latency ?? "0"} ms`} />
                        <Metric icon={<Upload className="w-4 h-4 text-gray-500" />} label="Upload" value={`${speedData?.upload ?? "0"} Mbps`} />
                        <Metric icon={<Download className="w-4 h-4 text-gray-500" />} label="Download" value={`${speedData?.download ?? "0"} Mbps`} />
                        <Metric icon={<Clock className="w-4 h-4 text-gray-500" />} label="Ping" value={`${speedData?.ping_ms ?? "0"} ms`} />
                        <Metric icon={<Clock className="w-4 h-4 text-gray-500" />} label="Last Scan" value={speedData?.timestamp ?? "--"} className="sm:col-span-2" />
                    </div>

                    {/* History chart */}
                    {history.length > 0 && (
                        <div className="mt-6 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <XAxis dataKey="timestamp" />
                                    <YAxis unit=" Mbps" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="upload" stroke="#3b82f6" name="Upload" />
                                    <Line type="monotone" dataKey="download" stroke="#ef4444" name="Download" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Outages */}
            <div className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-center">Check your ISP or Service Status</h2>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full">
                        <h3 className="text-xl text-center font-semibold mb-4">ISPs</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {outages.filter(o => o.category === "ISP").map(o => (
                                <OutageCard key={o.name} outage={o} />
                            ))}
                        </div>
                    </div>

                    <div className="w-full">
                        <h3 className="text-xl text-center font-semibold mb-4">Services</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {outages.filter(o => o.category === "Service").map(o => (
                                <OutageCard key={o.name} outage={o} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ----------------------- */
/* SMALL COMPONENTS BELOW */
/* ----------------------- */
const Metric = ({ icon, label, value, className }: { icon: any; label: string; value: string; className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
        {icon}
        <div className="flex flex-col">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    </div>
)

const OutageCard = ({ outage }: { outage: Outage }) => (
    <a
        href={outage.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col p-4 rounded-xl border border-gray-200 shadow hover:shadow-lg transition-all ${outage.colorClass}`}
    >
        <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5" />
            <p className="font-semibold">{outage.name}</p>
        </div>
    </a>
)

function getStatusBadge(status: StatusType) {
    switch (status) {
        case "online":
            return { label: "Online", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> }
        case "degraded":
            return { label: "Degraded", color: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-4 h-4 mr-1" /> }
        case "offline":
            return { label: "Offline", color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4 mr-1" /> }
        default:
            return { label: "Unknown", color: "bg-gray-100 text-gray-600", icon: null }
    }
}

export default ISPStatusPage
