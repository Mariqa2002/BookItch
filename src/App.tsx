import { Routes, Route, useLocation, type Location } from 'react-router-dom'
import { PageTransition } from '@/components/layout/PageTransition'
import Home from '@/pages/Home'
import MyBooks from '@/pages/MyBooks'
import BookDetail from '@/pages/BookDetail'
import ChapterPage from '@/pages/ChapterPage'
import Stats from '@/pages/Stats'
import Settings from '@/pages/Settings'

interface LocationState {
  backgroundLocation?: Location
}

export default function App() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const backgroundLocation = state?.backgroundLocation

  return (
    <>
      <PageTransition pathKey={(backgroundLocation ?? location).pathname}>
        <Routes location={backgroundLocation ?? location}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<MyBooks />} />
          <Route path="/books/:bookId" element={<BookDetail />} />
          <Route path="/books/:bookId/chapters/:chapterId" element={<ChapterPage />} />
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
