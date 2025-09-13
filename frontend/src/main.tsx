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
import ISPStatusPage from "./pages/ISPStatusPage"
import LoginPage from "./pages/LoginPage"
import SettingsPage from "./pages/SettingsPage"
import AccessLogs from "./pages/AccessLogsPage"
import Reports from "./pages/ReportsPage"
import Alerts from "./pages/AlertsPage"
import BandwidthPerDevicePage from "./pages/BandwidthPerDevicePage"
import AiInsightsPage from "./pages/AIInsightsPage"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// import { ClerkProvider } from '@clerk/clerk-react'

// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// if (!PUBLISHABLE_KEY) {
//   throw new Error('Missing Publishable Key')
// }

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
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
              <Route path="per-device" element={<BandwidthPerDevicePage />} />
            </Route>

            <Route path="/isp-status" element={<App />}>
              <Route index element={<ISPStatusPage />} />
            </Route>

            <Route path="/settings" element={<App />}>
              <Route index element={<SettingsPage />} />
            </Route>

            <Route path="/logs" element={<App />}>
              <Route index element={<AccessLogs />} />
            </Route>

            <Route path="/reports" element={<App />}>
              <Route index element={<Reports />} />
            </Route>

            <Route path="/alerts" element={<App />}>
              <Route index element={<Alerts />} />
            </Route>

            <Route path="/ai-insights" element={<App />}>
              <Route index element={<AiInsightsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
) 
