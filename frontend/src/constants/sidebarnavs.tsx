import { Home, ArrowUpDown, ChartBar, Monitor } from "lucide-react"

export const sidebarNavs = [
    { title: "Home", url: "/", icon: <Home /> },
    {
        title: "Devices", icon: <Monitor />,
        children: [
            { title: "All Devices", url: "/devices/all" },
            { title: "Whitelist", url: "/devices/whitelist" },
            { title: "Blacklist", url: "/devices/blacklist" },
        ],
    },
    { title: "Bandwidth Usage", url: "/bandwidth-usage", icon: <ArrowUpDown /> },
    { title: "Analytics", url: "/analytics", icon: <ChartBar /> },
    // { title: "Alerts", url: "/alerts", icon: <Bell /> },
];

