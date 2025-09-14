import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const fetchDNSstats = async () => {
  const res = await axios.get(
    `http://localhost:4000/network/dns/all-stats`
  )
  return res.data.data
}

export const fetchDeviceQueryLogs = async (deviceIp: string) => {
  const res = await axios.get("http://localhost:4000/network/dns/querylogs", {
    params: { deviceIp },
  });

  const queriesArray = res.data.data?.data || [];

  const queries = queriesArray.map((item: any) => ({
    time: new Date(item.time).toLocaleString(),
    domain: item.question.name,
  }));

  return queries;
};

export const blockUser = async (deviceIp: string) => {
  const res = await axios.post(`http://localhost:4000/network/dns/user/block/${deviceIp}`)

  return res
}

export const unblockUser = async (deviceIp: string) => {
  const res = await axios.post(`http://localhost:4000/network/dns/user/unblock/${deviceIp}`)

  return res
}

export const getAccessList = async (): Promise<{
  allowed_clients: string[]
  blocked_hosts: string[]
  disallowed_clients: string[]
}> => {
  const res = await axios.get("http://localhost:4000/network/dns/access-list")
  return res.data.data 
}


export const blockDomain = async (domain: string) => {
  console.log(domain)
  const res = await axios.post("http://localhost:4000/network/dns/domain/block", { domain })

  return res
}

export const useDNSStats = () => {
  return useQuery({
    queryKey: ["dnsStats"],
    queryFn: fetchDNSstats,
    // refetchInterval: 300_000, 
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  })
}
