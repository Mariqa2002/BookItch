import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import Login from '@/pages/Login'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider, useAuth } from '@/lib/auth'
import { LibraryProvider } from '@/data/store'
import './styles/index.css'

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg font-sans text-sm text-ink-muted">Loading…</div>
  }
  if (!session) {
    return <Login />
  }
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <LibraryProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <App />
            </BrowserRouter>
          </LibraryProvider>
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
