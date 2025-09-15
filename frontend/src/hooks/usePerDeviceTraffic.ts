"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

export interface DeviceTrafficSample {
    date: string;
    [deviceKey: string]: number | string;
}

interface RawTrafficRecord {
    address: string;
    rate_bits_in: number;
    rate_bits_out: number;
    rate_bits: number;
}

interface InterfaceData {
    records: RawTrafficRecord[];
    status: string;
}

interface ApiResponse {
    success: boolean;
    data: Record<string, InterfaceData>;
}

export function usePerDeviceTraffic() {
    const { data, error } = useSWR<ApiResponse>("http://localhost:4000/network/traffic/per-device"); // replace with your API endpoint
    const [sample, setSample] = useState<DeviceTrafficSample | null>(null);

    useEffect(() => {
        if (data?.success) {
            const flattened: DeviceTrafficSample = { date: new Date().toISOString() };

            Object.values(data.data).forEach(ifaceData => {
                if (ifaceData.status !== "ok") return; // skip timeouts
                ifaceData.records.forEach(record => {
                    flattened[`${record.address}-IN`] = record.rate_bits_in; // per second
                    flattened[`${record.address}-OUT`] = record.rate_bits_out; // per second
                });
            });

            setSample(flattened);
        }
    }, [data]);

    return { data: sample, error };
}
