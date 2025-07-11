import type { ChartConfig } from "@/components/ui/chart";
import { Wifi, SquareTerminal, Gauge, Settings2, Laptop, FileText, Brain, History, CircleAlert } from "lucide-react";

export const sidebarNavs = {
  user: {
    name: "Admin",
    email: "netdetect@example.com",
    avatar: "https://avatars.githubusercontent.com/u/163083905?v=4",
  },
  team: {
    name: "Netdetect",
    logo: Wifi,
    plan: "Capstone System",
  },
  sidebarNavsMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Devices",
      icon: Laptop,
      url: "/devices",
      items: [
        { title: "All Devices", url: "/devices/all" },
        { title: "Whitelist/Blacklist", url: "/devices/whitelist-blacklist" },
      ],
    },
    {
      title: "Bandwidth Usage",
      icon: Gauge,
      url: "/bandwidth-usage",
      items: [
        { title: "Overview", url: "/bandwidth-usage/overview" },
        { title: "Per Device", url: "/bandwidth-usage/per-device" },
      ],
    },
    {
      title: "ISP Status",
      url: "/isp-status",
      icon: Wifi,
    },
    {
      title: "AI Insights",
      url: "/ai-insights",
      icon: Brain,
    },

  ],
  sidebarNavsSecond: [
    {
      title: "Access Logs",
      url: "/logs",
      icon: History,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Alerts",
      url: "/alerts",
      icon: CircleAlert,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ]
};

export const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig