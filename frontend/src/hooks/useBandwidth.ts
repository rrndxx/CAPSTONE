import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const fetchPerDeviceTraffic = async (): Promise<any> => {
    const res = await axios.get("http://localhost:4000/network/traffic/per-device");
    return res.data.data;
};

export const usePerDeviceTraffic = () => {
    return useQuery({
        queryKey: ["perDeviceTraffic"],
        queryFn: fetchPerDeviceTraffic,
        refetchInterval: 1000,
        refetchOnWindowFocus: false,
        staleTime: 1000,
    });
};
