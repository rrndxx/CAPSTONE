import { Wifi, AlertCircle, Smartphone, ShieldOff } from "lucide-react";


const TopNavs = () => {

    const stats = [
        {
            label: "Connected Devices",
            value: 128,
            icon: <Smartphone className="w-6 h-6 text-green-500" />,
        },
        {
            label: "Unauthorized Devices",
            value: 5,
            icon: <ShieldOff className="w-6 h-6 text-red-500" />,
        },
        {
            label: "ISP Status",
            value: "42 Mbps",
            icon: <Wifi className="w-6 h-6 text-blue-500" />,
        },
        {
            label: "Critical Alerts",
            value: 3,
            icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
        },
    ];
    return (
        <>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-primary-foreground rounded-lg p-4 flex items-center gap-4 shadow"
                >
                    <div className="p-2 bg-muted rounded-full">{stat.icon}</div>
                    <div>
                        <p className="text-xl font-semibold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                </div>
            ))}
        </>
    )
}

export default TopNavs