import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const fetchSystemTime = async () => {
    const res = await axios.get(`http://localhost:4000/network/system-time`)
    return res.data.data
}

export const useSystemTime = () => {
    return useQuery({
        queryKey: ["system-time"],
        queryFn: fetchSystemTime,
        refetchInterval: 300_000,
        staleTime: 300_000,
        refetchOnWindowFocus: false,
    })
}
