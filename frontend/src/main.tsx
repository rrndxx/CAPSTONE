import './index.css'
import App from './App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './provider/ThemeProvider.tsx'
import Homepage from './pages/Homepage.tsx'
import DevicesPage from './pages/DevicesPage.tsx'
import BlacklistPage from './pages/BlacklistPage.tsx'
import WhitelistPage from './pages/WhitelistPage.tsx'
import BandwidthUsagePage from './pages/BandwidthUsagePage.tsx'
import AnalyticsPage from './pages/AnalyticsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Homepage />} />
            <Route path="/devices/all" element={<DevicesPage />} />
            <Route path="/devices/whitelist" element={<WhitelistPage />} />
            <Route path="/devices/blacklist" element={<BlacklistPage />} />
            <Route path="/bandwidth-usage" element={<BandwidthUsagePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
