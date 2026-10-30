import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from '@/lib/theme'
import { LibraryProvider } from '@/data/store'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LibraryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LibraryProvider>
    </ThemeProvider>
  </StrictMode>,
)
