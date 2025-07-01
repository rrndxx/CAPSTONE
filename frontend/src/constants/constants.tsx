import { ArrowUpDown, Home, Smartphone } from "lucide-react";

export const navs = [
  { id: 1, title: "Home", icon: <Home size={24} />, href: "/dashboard" },
  { id: 2, title: "Connected Devices", icon: <Smartphone size={24} />, href: "/devices" },
  { id: 3, title: "Bandwidth Usage", icon: <ArrowUpDown size={24} />, href: "/bandwidth" },
];