import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const fetchQueryLogs = async () => {
  const res = await axios.get(
    // `http://localhost:4000/devices/all?interfaceId=${interfaceId}`
  )
  return res.data.data
}

export const fetchTopDomains = async () => {
  const res = await axios.get(
    // `http://localhost:4000/devices/all?interfaceId=${interfaceId}`
  )
  return res.data.data
}

export const fetchTopClients = async () => {
  const res = await axios.get(
    // `http://localhost:4000/devices/all?interfaceId=${interfaceId}`
  )
  return res.data.data
}

export const fetchBlockedWebsites = async () => {
  const res = await axios.get(
    // `http://localhost:4000/devices/all?interfaceId=${interfaceId}`
  )
  return res.data.data
}

export const useDevices = (interfaceId: number) => {
  return useQuery({
    queryKey: ["devices", interfaceId],
    // queryFn: () => fetchDevices(interfaceId),
    refetchInterval: 60_000,              
    staleTime: 60_000,                   
    refetchOnWindowFocus: false,
    enabled: !!interfaceId, 
  })
}
