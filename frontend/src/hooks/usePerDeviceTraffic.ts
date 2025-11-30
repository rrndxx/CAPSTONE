"use client";

import { useState, useEffect } from "react";
import axios from "axios";

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
    const [sample, setSample] = useState<DeviceTrafficSample | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get<ApiResponse>("http://localhost:4000/network/traffic/per-device");
                const data = res.data;

                if (data.success) {
                    const flattened: DeviceTrafficSample = { date: new Date().toISOString() };

                    Object.values(data.data).forEach(ifaceData => {
                        if (ifaceData.status !== "ok") return; // skip timeouts
                        ifaceData.records.forEach(record => {
                            flattened[`${record.address}-IN`] = record.rate_bits_in;
                            flattened[`${record.address}-OUT`] = record.rate_bits_out;
                        });
                    });

                    setSample(flattened);
                }
            } catch (err) {
                console.error("Failed to fetch device traffic:", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);

        return () => clearInterval(interval);
    }, []);

    return sample;
}