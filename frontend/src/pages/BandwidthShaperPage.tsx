import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PipesTab from "@/components/pipestab";
import QueuesTab from "@/components/queuestab";
import SpeedCapsTab from "@/components/speedcapstab";

type Tab = "Pipes" | "Queues" | "Rules";

const BandwidthShaperPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>("Pipes");

    return (
        <div className="p-4 sm:p-6 bg-background min-h-screen">
            <div className="flex gap-2 mb-4">
                {(["Pipes", "Queues", "Rules"] as Tab[]).map((t) => (
                    <Button
                        key={t}
                        variant={tab === t ? "default" : "outline"}
                        className={`${tab === t ? "bg-primary text-white" : "bg-background text-primary"}`}
                        onClick={() => setTab(t)}
                    >
                        {t}
                    </Button>
                ))}
            </div>

            <Card className="p-0">
                <CardContent className="p-4 space-y-6">
                    {tab === "Pipes" && <PipesTab />}
                    {tab === "Queues" && <QueuesTab />}
                    {tab === "Rules" && <SpeedCapsTab />}
                </CardContent>
            </Card>
        </div>
    );
};

export default BandwidthShaperPage;
