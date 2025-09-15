import { useState, useEffect } from "react";
import { InterfaceTrafficChart } from "@/components/perinterfacetrafficchart";
import { PerInterfaceTrafficTable } from "@/components/perinterfacetraffictable";
import { SidebarInset } from "@/components/ui/sidebar";
import { useInterfaceTraffic, type DeltaTraffic } from "@/hooks/useInterfaceTraffic.ts";

const BandwidthUsagePage = () => {
    const { data: newSample } = useInterfaceTraffic();
    const [trafficHistory, setTrafficHistory] = useState<DeltaTraffic[]>([]);

    useEffect(() => {
        if (newSample) {
            setTrafficHistory(prev => [...prev.slice(-59), newSample]);
        }
    }, [newSample]);

    if (!trafficHistory.length) return <div>Loading...</div>;

    return (
        <SidebarInset>
            <div className="flex flex-col gap-6 p-4 pt-0">
                <section className="space-y-6">
                    <div className="bg-background min-h-[300px]">
                        <InterfaceTrafficChart data={trafficHistory} />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Interfaces</h2>
                    <div className="bg-background min-h-[300px]">
                        <PerInterfaceTrafficTable data={trafficHistory} />
                    </div>
                </section>
            </div>
        </SidebarInset>
    );
};

export default BandwidthUsagePage;
