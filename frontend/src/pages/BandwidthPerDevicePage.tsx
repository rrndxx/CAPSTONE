import { SidebarInset } from "@/components/ui/sidebar";
import { PerDeviceTrafficTable } from "@/components/perdevicetraffictable";
import { PerDeviceTrafficChart } from "@/components/perdevicetrafficchart";
import { usePerDeviceTraffic } from "@/hooks/usePerDeviceTraffic";
import { Loader2 } from "lucide-react";

const BandwidthPerDevicePage = () => {
  const latestSample = usePerDeviceTraffic();

  if (!latestSample) return <div className="h-full w-full flex flex-col justify-center items-center gap-4"><Loader2 className="h-16 w-16 animate-spin" /><p className="text-lg ">LOADING BANDWIDTH USAGE</p></div>

  return (
    <SidebarInset>
      <div className="flex flex-col gap-6 p-4 pt-0">
        <section className="space-y-6">
          <PerDeviceTrafficChart />
        </section>
        <section className="space-y-6">
          <h2 className="text-lg font-semibold mb-2">Per-Device Traffic</h2>
          <PerDeviceTrafficTable />
        </section>
      </div>
    </SidebarInset>
  );
};

export default BandwidthPerDevicePage;
