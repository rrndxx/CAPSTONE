import "./index.css"
import App from "./App"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
// import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from "./provider/ThemeProvider"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainDashboardPage from "./pages/MainDashboardPage"
import DevicesPage from "./pages/DevicesPage"
import NotFound from "./pages/PageNotFound"
import WhitelistBlacklistPage from "./pages/WhitelistBlacklistPage"
import BandwidthUsagePage from "./pages/BandwidthUsagePage"
import { ISPStatusPage } from "./pages/ISPStatusPage"
import LoginPage from "./pages/LoginPage"

// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// if (!PUBLISHABLE_KEY) {
//   throw new Error('Missing Publishable Key')
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/dashboard" element={<App />}>
            <Route index element={<MainDashboardPage />} />
          </Route>

          <Route path="/devices" element={<App />}>
            <Route index element={<DevicesPage />} />
            <Route path="all" element={<DevicesPage />} />
            <Route path="whitelist-blacklist" element={<WhitelistBlacklistPage />} />
          </Route>

          <Route path="/bandwidth-usage" element={<App />}>
            <Route index element={<BandwidthUsagePage />} />
            <Route path="overview" element={<BandwidthUsagePage />} />
          </Route>

          <Route path="/isp-status" element={<App />}>
            <Route index element={<ISPStatusPage provider="FiberNet" speed="42 Mbps" status="online" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
) 
