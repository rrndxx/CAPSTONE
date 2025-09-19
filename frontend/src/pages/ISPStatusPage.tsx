import { useState, useEffect } from "react"
import { Wifi, CheckCircle2, XCircle, Globe, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatusType = "online" | "degraded" | "offline"

interface Outage {
    name: string
    category: "ISP" | "Service"
    url: string
    colorClass: string
}

const ISPStatusPage = () => {
    const PLAN_SPEED = 300 // Mbps

    const [status,] = useState<StatusType>("online")
    const [speedData,] = useState({
        download: 0,
        upload: 0,
        ping: 0,
        jitter: 0,
        history: [] as number[],
    })
    const [outages, setOutages] = useState<Outage[]>([])

    useEffect(() => {
        const popularOutages: Outage[] = [
            // ISPs
            { name: "PLDT", category: "ISP", url: "https://downdetector.ph/status/pldt/", colorClass: "bg-white text-[#ED1C24]" },
            { name: "Dito", category: "ISP", url: "https://downdetector.ph/status/dito/", colorClass: "bg-white text-[#ED1C24]" },
            { name: "Converge", category: "ISP", url: "https://downdetector.ph/status/converge/", colorClass: "bg-white text-[#12918e]" },
            { name: "Globe", category: "ISP", url: "https://downdetector.ph/status/globe/", colorClass: "bg-[#0066CC] text-white" },
            { name: "Smart", category: "ISP", url: "https://downdetector.ph/status/smart/", colorClass: "bg-gradient-to-r from-[#00B140] to-[#FFD600] text-white" },
            { name: "TNT", category: "ISP", url: "https://downdetector.ph/status/tnt/", colorClass: "bg-gradient-to-r from-[#FFA500] via-[#FFD600] to-[#FFA500] text-white" },

            // Services
            { name: "Facebook", category: "Service", url: "https://downdetector.ph/status/facebook/", colorClass: "bg-[#1877F2] text-white" },
            { name: "YouTube", category: "Service", url: "https://downdetector.ph/status/youtube/", colorClass: "bg-[#FF0000] text-white" },
            { name: "TikTok", category: "Service", url: "https://downdetector.ph/status/tiktok/", colorClass: "bg-[#000000] text-white" },
            { name: "Netflix", category: "Service", url: "https://downdetector.ph/status/netflix/", colorClass: "bg-[#E50914] text-white" },
            { name: "Instagram", category: "Service", url: "https://downdetector.ph/status/instagram/", colorClass: "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white" },
        ]
        setOutages(popularOutages)
    }, [])

    const badge = getStatusBadge(status)

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">

            {/* ISP Overview */}
            <Card className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100">
                <CardHeader className="py-4 bg-primary">
                    <CardTitle className="flex items-center gap-2 text-black font-medium uppercase tracking-wide">
                        <Wifi className="w-5 h-5 text-black" />
                        ISP Status and Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex justify-between items-center flex-wrap">
                        <div>
                            <p className="text-xs text-gray-400">Provider</p>
                            <p className="text-lg font-semibold text-gray-800">Globe Telecom</p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color} shadow-sm mt-2 sm:mt-0`}>
                            {badge.icon}
                            {badge.label}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        <p className="text-xs text-gray-400">Plan Speed</p>
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-gray-800">{PLAN_SPEED} Mbps</p>
                            <p className="text-sm text-gray-500">{speedData.download.toFixed(1)} Mbps</p>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full mt-1">
                            <div
                                className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${(speedData.download / PLAN_SPEED) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Actual vs Plan</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700 mt-2">
                        <Metric label="Client IP" value="180.190.125.156" />
                        <Metric label="Server" value="Cebu City" />
                        <Metric label="Latency" value={`${speedData.ping.toFixed(2)} ms`} />
                        <Metric label="Upload" value={`${speedData.upload.toFixed(2)} Mbps`} />
                        <Metric label="Download" value={`${speedData.download.toFixed(2)} Mbps`} />
                        <Metric label="Ping" value={`${speedData.ping.toFixed(2)} ms`} />
                        <Metric label="Jitter" value={`${speedData.jitter.toFixed(2)} ms`} />
                        <Metric label="Last Scan" value={new Date().toLocaleTimeString()} className="sm:col-span-2" />
                    </div>

                    <p className="text-xs text-gray-400 pt-2">Last checked: just now</p>
                </CardContent>
            </Card>

            {/* Outages Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                    Having internet problems? Check popular providers & services:
                </h2>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ISPs */}
                    <div className="w-full">
                        <h3 className="text-xl text-center font-semibold text-gray-600 mb-4">ISPs</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {outages.filter(o => o.category === "ISP").map((o) => (
                                <OutageCard key={o.name} outage={o} />
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="w-full">
                        <h3 className="text-xl text-center font-semibold text-gray-600 mb-4">Services</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {outages.filter(o => o.category === "Service").map((o) => (
                                <OutageCard key={o.name} outage={o} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / See more section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-200 rounded-2xl text-center shadow-sm flex flex-col gap-4">
                <p className="text-sm text-gray-600 font-medium">
                    Want to see real-time outage reports and updates?
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a
                        href="https://downdetector.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                        <Globe className="w-4 h-4" />
                        Downdetector.com
                    </a>
                    <a
                        href="https://downdetector.ph/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all"
                    >
                        <Globe className="w-4 h-4" />
                        Downdetector.ph
                    </a>
                </div>
                <p className="text-xs text-gray-400">
                    Stay updated on your ISP and favorite services at any time.
                </p>
            </div>
        </div>
    )
}

// Metric helper
const Metric = ({ label, value, className }: { label: string, value: string, className?: string }) => (
    <div className={className}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
)

// Outage card component
const OutageCard = ({ outage }: { outage: Outage }) => (
    <a
        href={outage.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col p-4 rounded-xl border border-gray-200 shadow hover:shadow-lg transition-all duration-300 ${outage.colorClass}`}
    >
        <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5" />
            <p className="font-semibold">{outage.name}</p>
        </div>
    </a>
)

// Helper functions
function getStatusBadge(status: StatusType) {
    switch (status) {
        case "online": return { label: "Online", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> }
        case "degraded": return { label: "Degraded", color: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-4 h-4 mr-1" /> }
        case "offline": return { label: "Offline", color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4 mr-1" /> }
        default: return { label: "Unknown", color: "bg-gray-100 text-gray-600", icon: null }
    }
}

export default ISPStatusPage
