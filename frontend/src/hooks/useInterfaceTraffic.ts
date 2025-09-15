import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type InterfaceName = "LAN" | "WAN" | "OPT1";

export interface DeltaTraffic {
    date: string;
    [key: string]: number | string;
}

interface InterfaceData {
    [key: string]: {
        "bytes received": number;
        "bytes transmitted": number;
    };
}

interface RawTrafficResponse {
    success: boolean;
    data: {
        interfaces: InterfaceData;
    };
}

// Previous counters to calculate deltas
const prevCounters: Record<InterfaceName, { in: number; out: number }> = {
    LAN: { in: 0, out: 0 },
    WAN: { in: 0, out: 0 },
    OPT1: { in: 0, out: 0 },
};

export const fetchInterfaceTraffic = async (): Promise<DeltaTraffic> => {
    try {
        const res = await axios.get<RawTrafficResponse>("http://localhost:4000/network/traffic/interface");
        const data = res.data;

        const timestamp = new Date().toISOString();
        const sample: DeltaTraffic = { date: timestamp };

        if (!data.success || !data.data?.interfaces) return sample;

        (["LAN", "WAN", "OPT1"] as InterfaceName[]).forEach((intf) => {
            const iface = data.data.interfaces[intf.toLowerCase()];
            if (iface) {
                const bytesIn = Number(iface["bytes received"]);
                const bytesOut = Number(iface["bytes transmitted"]);

                const deltaIn = bytesIn - (prevCounters[intf]?.in || 0);
                const deltaOut = bytesOut - (prevCounters[intf]?.out || 0);

                prevCounters[intf] = { in: bytesIn, out: bytesOut };

                sample[`${intf}-IN`] = deltaIn;
                sample[`${intf}-OUT`] = deltaOut;
            } else {
                sample[`${intf}-IN`] = 0;
                sample[`${intf}-OUT`] = 0;
            }
        });

        return sample;
    } catch (err) {
        console.error("Failed to fetch interface traffic:", err);
        return {
            date: new Date().toISOString(),
            "LAN-IN": 0,
            "LAN-OUT": 0,
            "WAN-IN": 0,
            "WAN-OUT": 0,
            "OPT1-IN": 0,
            "OPT1-OUT": 0,
        };
    }
};

export const useInterfaceTraffic = () => {
    return useQuery({
        queryKey: ["interfaceTraffic"],
        queryFn: fetchInterfaceTraffic,
        refetchInterval: 1000, // fetch every second
        staleTime: 1000,
        refetchOnWindowFocus: false,
    });
};
