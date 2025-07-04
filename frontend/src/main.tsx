import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Homepage from './pages/Homepage.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/provider/ThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <App children={<Homepage />} />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
