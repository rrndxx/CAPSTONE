import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export const fetchDevices = async (interfaceId: number) => {
  const res = await axios.get(
    `http://localhost:4000/devices/all?interfaceId=${interfaceId}`
  )
  return res.data.data
}

export const useDevices = (interfaceId: number) => {
  return useQuery({
    queryKey: ["devices", interfaceId],
    queryFn: () => fetchDevices(interfaceId),
    enabled: !!interfaceId, // only fetch if interfaceId is provided
  })
}
