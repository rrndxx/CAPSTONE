import { useState, useEffect } from "react";
import axios from "axios";

export interface DeviceTrafficSample {
    date: string;
    [deviceKey: string]: number | string;
}

/**
 * Hook to fetch live per-device bandwidth traffic
 * from your backend `/bandwidth/live` endpoint.
 */
export function usePerDeviceTraffic() {
    const [sample, setSample] = useState<DeviceTrafficSample | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch latest per-second snapshot from backend
                const res = await axios.get<{
                    success: boolean;
                    devices: Record<string, { download: number; upload: number }>;
                }>("http://localhost:4000/bandwidth/live");

                if (res.data.success) {
                    const flattened: DeviceTrafficSample = { date: new Date().toISOString() };

                    // Flatten data: mac-IN and mac-OUT keys
                    Object.entries(res.data.devices).forEach(([mac, data]) => {
                        flattened[`${mac}-IN`] = data.download;
                        flattened[`${mac}-OUT`] = data.upload;
                    });

                    setSample(flattened);
                }
            } catch (err) {
                console.error("Failed to fetch live device traffic:", err);
            }
        };

        // Initial fetch
        fetchData();

        // Poll every second
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    return sample;
}
