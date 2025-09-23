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
import WebFilteringPage from "./pages/WebFilteringPage"
import BandwidthShaperPage from "./pages/BandwidthShaperPage"
import { ProtectedRoute } from "./provider/ProtectedRoutes"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<MainDashboardPage />} />
            </Route>

            <Route path="/devices" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<DevicesPage />} />
              <Route path="all" element={<DevicesPage />} />
              <Route path="whitelist-blacklist" element={<WhitelistBlacklistPage />} />
            </Route>

            <Route path="/bandwidth-usage" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<BandwidthUsagePage />} />
              <Route path="overview" element={<BandwidthUsagePage />} />
              <Route path="per-device" element={<BandwidthPerDevicePage />} />
              <Route path="shaper" element={<BandwidthShaperPage />} />
            </Route>

            <Route path="/web-filtering" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<WebFilteringPage />} />
            </Route>

            <Route path="/isp-status" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<ISPStatusPage />} />
            </Route>

            <Route path="/settings" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<SettingsPage />} />
            </Route>

            <Route path="/logs" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<AccessLogs />} />
            </Route>

            <Route path="/reports" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<Reports />} />
            </Route>

            <Route path="/alerts" element={<ProtectedRoute><App /></ProtectedRoute>}>
              <Route index element={<Alerts />} />
            </Route>

            <Route path="/ai-insights" element={<ProtectedRoute><App /></ProtectedRoute>}>
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
