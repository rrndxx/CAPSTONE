"use client";

import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { PerDeviceTrafficTable } from "@/components/perdevicetraffictable";
import { usePerDeviceTraffic, type DeviceTrafficSample } from "@/hooks/usePerDeviceTraffic";
import { PerDeviceTrafficChart } from "@/components/perdevicetrafficchart";

const BandwidthPerDevicePage = () => {
  const latestSample = usePerDeviceTraffic();
  const [trafficHistory, setTrafficHistory] = useState<DeviceTrafficSample[]>([]);

  useEffect(() => {
    if (latestSample) {
      setTrafficHistory(prev => [...prev.slice(-59), latestSample]); // keep last 60 samples
    }
  }, [latestSample]);

  if (!trafficHistory.length) return <div>Loading...</div>;

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <section className="space-y-6">
          <PerDeviceTrafficChart data={trafficHistory} />
        </section>
        <section className="space-y-6">
          <PerDeviceTrafficTable data={trafficHistory} />
        </section>
      </div>
    </SidebarInset>
  );
};

export default BandwidthPerDevicePage;
