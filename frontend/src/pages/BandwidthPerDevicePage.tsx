import { useEffect, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { PerDeviceTrafficTable } from "@/components/perdevicetraffictable";
import { PerDeviceTrafficChart, type DeviceTrafficEntry } from "@/components/perdevicetrafficchart";
import { Loader2 } from "lucide-react";

const BandwidthPerDevicePage = () => {
  const [trafficData, setTrafficData] = useState<DeviceTrafficEntry[]>([]);
  const [totalsData, setTotalsData] = useState<DeviceTrafficEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const [perDeviceRes, totalsRes] = await Promise.all([
          fetch("http://localhost:4000/bandwidth/per-device"),
          fetch("http://localhost:4000/bandwidth/per-device-total")
        ]);

        const perDeviceJson = await perDeviceRes.json();
        const totalsJson = await totalsRes.json();

        if (perDeviceJson.success && totalsJson.success) {
          // Append new points to the chart data for smooth animation
          setTrafficData(prev => [...prev, ...perDeviceJson.data].slice(-50)); // keep last 50 points
          setTotalsData(totalsJson.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch traffic:", err);
      }
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, 3000); // poll every 3s
    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return (
      <SidebarInset>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <section className="space-y-6">
          <PerDeviceTrafficChart trafficData={trafficData} />
        </section>
        <section className="space-y-6">
          <h2 className="text-lg font-semibold mb-2">Per-Device Traffic (Totals)</h2>
          <PerDeviceTrafficTable trafficData={totalsData} />
        </section>
      </div>
    </SidebarInset>
  );
};

export default BandwidthPerDevicePage;
