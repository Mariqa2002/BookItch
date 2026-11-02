import { useEffect } from 'react'
import { Routes, Route, useLocation, type Location } from 'react-router-dom'
import { PageTransition } from '@/components/layout/PageTransition'
import Home from '@/pages/Home'
import MyBooks from '@/pages/MyBooks'
import BookDetail from '@/pages/BookDetail'
import ChapterPage from '@/pages/ChapterPage'
import NotesInsights from '@/pages/NotesInsights'
import Stats from '@/pages/Stats'
import Settings from '@/pages/Settings'

interface LocationState {
  backgroundLocation?: Location
}

export default function App() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const backgroundLocation = state?.backgroundLocation
  const pageKey = (backgroundLocation ?? location).pathname

  // Land at the top of every new page instead of wherever the previous
  // page happened to be scrolled to. Keyed on the actual page (not the
  // Settings overlay's own location), so opening Settings on top of a
  // scrolled page doesn't yank the background page back to the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pageKey])

  return (
    <>
      <PageTransition pathKey={pageKey}>
        <Routes location={backgroundLocation ?? location}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<MyBooks />} />
          <Route path="/books/:bookId" element={<BookDetail />} />
          <Route path="/books/:bookId/chapters/:chapterId" element={<ChapterPage />} />
          <Route path="/notes" element={<NotesInsights />} />
          <Route path="/stats" element={<Stats />} />
          {/* Settings is also reachable directly (e.g. a bookmark or refresh) —
              it still renders, just without a background page flipping in behind it. */}
          <Route path="/settings" element={<Home />} />
        </Routes>
      </PageTransition>

      {/* Settings renders as a modal on top of whatever page is "behind" it,
          per the design (design/pages/settings.html overlays Main). */}
      {(backgroundLocation || location.pathname === '/settings') && (
        <Routes>
          <Route path="/settings" element={<Settings />} />
        </Routes>
      )}
    </>
  )
}
