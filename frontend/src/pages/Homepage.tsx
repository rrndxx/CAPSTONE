import AuditTrailCard from "@/components/AuditTrailCard";
import Barchart from "@/components/Barchart";
import { Linechart } from "@/components/Linechart";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import TopNavs from "@/components/TopNavs";

const Homepage = () => {
  const cardSettings = "grid grid-cols-1 gap-4";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-4">

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:col-span-6">
        <TopNavs />
      </div>

      {/* Left Column */}
      <div className={cn(cardSettings, "lg:col-span-2 flex flex-col justify-between")}>
        <div className="flex bg-primary-foreground p-4 rounded-lg h-150 items-center justify-center">
          Some Content
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold">Previous Actions</h1>
            <History className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg h-58">
            <AuditTrailCard />
          </div>
        </div>
      </div>

      {/* Center Column */}
      <div className={cn(cardSettings, "lg:col-span-4")}>
        <div className="bg-primary-foreground rounded-lg">
          <Linechart />
        </div>
        <div className="bg-primary-foreground rounded-lg">
          <Barchart />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
