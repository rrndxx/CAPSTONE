import "./index.css"
import App from "./App"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { ThemeProvider } from "./provider/ThemeProvider"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainDashboardPage from "./pages/MainDashboardPage"
import DevicesPage from "./pages/DevicesPage"
import NotFound from "./pages/PageNotFound"
import WhitelistBlacklistPage from "./pages/WhitelistBlacklistPage"
import BandwidthUsagePage from "./pages/BandwidthUsagePage"
import { ISPStatusPage } from "./pages/ISPStatusPage"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<MainDashboardPage />} />
            <Route path="devices/all" element={<DevicesPage />} />
            <Route path="devices/whitelist-blacklist" element={<WhitelistBlacklistPage />} />
            <Route path="/bandwidth-usage" element={<BandwidthUsagePage />} />
            <Route path="/isp-status" element={<ISPStatusPage provider="FiberNet" speed="42 Mbps" status="online" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
) 
