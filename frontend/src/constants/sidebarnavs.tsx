import { Home, ArrowUpDown, ChartBar, Monitor, Plus, Bell } from "lucide-react"

export const sidebarNavs = [
    { title: "Home", url: "/", icon: <Home /> },
    {
        title: "Devices", icon: <Monitor />,
        children: [
            { title: "All Devices", url: "/devices", icon: <Monitor /> },
            { title: "Add Device", url: "/devices/add", icon : <Plus /> },
        ],
    },
    { title: "Bandwidth Usage", url: "/bandwidth-usage", icon: <ArrowUpDown /> },
    { title: "Analytics", url: "/analytics", icon: <ChartBar /> },
    // { title: "Alerts", url: "/alerts", icon: <Bell /> },
];

