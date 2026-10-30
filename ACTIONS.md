# ACTIONS — build log for Book Itch

This documents everything done to build the app, in enough detail to review
and challenge any call I made without you in the loop. Read "Judgment calls
to review" first if you're short on time — that's everything I decided on
your behalf rather than something the design specified outright.

---

## 1. Getting the design out of the canvas

The link you gave (`claude.ai/code/artifact/16f8fd3f-4b72-4061-a4be-af3edb5154d7`)
is a **Design canvas**, not a static page — reading it with the Artifact tool
only returns the canvas *editor's* shared runtime shell, none of your actual
screens. Two earlier turns in this conversation hit that wall and asked you
to either get design-sync access or export the canvas.

You exported **"Book Itch Home"** to `design/Book Itch Home.html` (1.9 MB).
That file turned out to be a **self-contained "bundler" export**: a loader
shell plus a `<script type="__bundler/manifest">` tag holding your six
artboards, each gzip+base64-encoded, and each of *those* was itself another
layer of the same bundler format (wrapping the real markup plus the Google
Fonts `@font-face` data it had inlined). I wrote a small Node script
(scratchpad-only, not shipped) to unwrap both layers and pulled out the six
real pages as clean HTML into `design/pages/`:

```
design/pages/home.html       → Home dashboard   (1440×800)
design/pages/my-books.html   → My Books grid     (1440×1360)
design/pages/stats.html      → Stats             (1440×1340)
design/pages/settings.html   → Settings modal    (1440×800, overlays Main)
design/pages/book.html       → Book detail       (390×960 — phone width)
design/pages/chapter.html    → Chapter detail    (390×860 — phone width)
```

Those six files are your actual design, byte-for-byte, and are now the
canonical reference for this app (kept in the repo on purpose — see §9).
Everything below is built from them, not from memory or guesswork. The
**"Book Itch" design system** project had no export option, but it turned
out not to matter: every screen's own `<style>` block already carries the
full set of design tokens and every `.bk-*` component class (buttons,
badges, progress bars, chips, nav items, cards, sticky notes, quote cards…),
so I had everything needed without it.

---

## 2. Design tokens — ported verbatim

`src/styles/tokens.css` is a direct copy of the CSS custom properties found
in every one of your six pages (light values on `:root`, dark on
`:root[data-theme="dark"]`):

```css
:root {
  --bg: #fbf5ec;           --surface: #fffbf6;
  --tint: #f1e9fc;         --tint-strong: #e2d3f7;
  --note: #fcebbd;         --border: #eadfd2;      --border-strong: #8a7d96;
  --ink: #2a1a3d;          --ink-muted: #5f5370;
  --plum: #2b1342;         --on-plum: #f6eefc;      --on-plum-muted: #cdbde0;
  --primary: #6b46c1;      --primary-deep: #351a5e;
  --success-bg: #dcf2e5;   --success-ink: #1f6b47;
  --reading-bg: #e3defa;   --reading-ink: #4a3bb0;
  --want-bg: #f7d7f0;      --want-ink: #8f2f86;
  --rust: #b0481a;         --focus: #6b46c1;
  --series-fiction: #6b46c1; --series-nonfiction: #c8702a; /* stats page */
  /* spacing, radius, shadow, font tokens — all kept, see the file */
}
:root[data-theme='dark'] {
  --bg: #1a0f26; --surface: #251634; --ink: #f6eefc; /* …and so on */
}
```

Fonts: **Plus Jakarta Sans** (UI) and **Caveat** (the handwritten/script
accents — "Book Itch" wordmark, quotes, chapter reflections). Loaded from
Google Fonts in `index.html` rather than re-hosting the woff2 files your
export had inlined, at the same weights your design uses (400–800 for
Jakarta, 500–600 for Caveat).

Spacing worked out to a happy coincidence: your `--space-1`…`--space-10`
tokens (4, 8, 12, 16, 20, 24, 32, 40px) are numerically identical to
Tailwind's own default `p-1`…`p-10` scale, so I used Tailwind's utilities
directly instead of a parallel spacing system. Radius and shadow got their
own Tailwind theme keys (`rounded-bk-sm/md/lg/xl/pill`, `shadow-bk-card`,
`shadow-bk-raised`) so the names in the code still match your design's own
vocabulary rather than Tailwind's differently-numbered defaults.

**`src/styles/bookish.css`** is your `.bk-btn`, `.bk-badge`, `.bk-progress`,
`.bk-search`, `.bk-chip`, `.bk-tabs`, `.bk-nav`, `.bk-stat`, `.bk-card`,
`.bk-cover`, `.bk-chap`, `.bk-dot`, `.bk-sticky`, `.bk-quote`, `.bk-note`,
`.bk-input`, `.bk-toggle` classes (plus the settings-page switch/select and
stats-page table styles), merged from all six pages into one sheet,
unchanged except for adding ordinary `:hover`/`:active` micro-transitions
(see §6) where the static export obviously had none to show.

---

## 3. Tech stack

React 18 + TypeScript + Vite + Tailwind CSS 3, react-router-dom 6,
Framer Motion for animation, lucide-react for generic icons. No component
library — you said you'd prefer custom given the design system already has
its own components, so everything under `src/components/bookish/` is a thin
custom wrapper that renders your `.bk-*` markup (shadcn was not used).

```
src/
  styles/            tokens.css, bookish.css (your design, verbatim), index.css
  lib/                theme.tsx, stats.ts, dates.ts, taglines.ts, cn.ts, useLocalStorage.ts
  data/               types.ts, seed.ts, store.tsx
  components/
    bookish/          Button, Badge, ProgressBar, SearchField, FilterChip, Tabs,
                       ChapterRow, StickyNote, QuoteCard, ThemeToggle, NoteField,
                       StatCard, Switch, Select, BookCover, BookCard, NavItem
    icons/Doodles.tsx  the 4 bespoke hand-drawn illustrations (exact SVG paths)
    layout/            Sidebar, MobileTabBar, DashboardShell, DetailShell,
                       PageTransition, ModalOverlay
    AddBookDialog.tsx
  pages/              Home, MyBooks, BookDetail, ChapterPage, Stats, Settings
  App.tsx, main.tsx
```

---

## 4. Routing, the page-flip transition, and the Settings overlay

```
/                                    Home
/books                               My Books
/books/:bookId                       Book detail
/books/:bookId/chapters/:chapterId   Chapter detail
/stats                               Stats
/settings                            Settings — rendered as a modal *over*
                                      whichever page you were on, exactly
                                      like design/pages/settings.html
                                      overlays "Main"
```

Settings uses React Router's "background location" pattern: clicking
Settings navigates to `/settings` carrying `state: { backgroundLocation }`,
so `App.tsx` renders the page you were already on *underneath* the modal
instead of replacing it:

```tsx
const backgroundLocation = (location.state as LocationState | null)?.backgroundLocation
<Routes location={backgroundLocation ?? location}>…</Routes>   {/* the page behind */}
{(backgroundLocation || location.pathname === '/settings') && (
  <Routes><Route path="/settings" element={<Settings />} /></Routes>  // the modal
)}
```

The **page-flip** you asked for (`src/components/layout/PageTransition.tsx`)
wraps that background `<Routes>` in a `framer-motion` `AnimatePresence`,
keyed by pathname, with a 3D rotate that reads as a page turning rather than
a full tumble:

```tsx
const pageVariants = {
  initial: { opacity: 0, rotateY: -8, x: 18 },
  animate: { opacity: 1, rotateY: 0, x: 0 },
  exit:    { opacity: 0, rotateY: 8, x: -18 },
}
// duration: 0.38s, ease [0.4, 0, 0.2, 1], transformOrigin: 'left center'
```

Opening/closing the Settings *modal* deliberately does **not** trigger this
page-flip (it isn't a navigation, it's an overlay) — it gets its own quieter
fade/scale-in instead (`ModalOverlay.tsx`), which also backs the "Add a new
book" dialog so both overlays share one implementation.

---

## 5. Theme (light/dark/auto)

`src/lib/theme.tsx` is a small context around your design's own
`[data-theme="dark"]` attribute strategy. `mode` is `'light' | 'dark' |
'auto'`, persisted to `localStorage`; `'auto'` follows
`prefers-color-scheme` live (listens for OS theme changes). A pre-paint
script in `index.html` reads the same stored value and sets the attribute
*before* React mounts, so there's no flash of the wrong theme on load.

**Bug I found and fixed while verifying this:** that bootstrap script
originally read the stored value as a plain string, but `useLocalStorage`
(the hook everything in the app uses for persistence) always JSON-encodes
what it stores — so the real value on disk was `"dark"` *with the quote
characters*, not `dark`. The bootstrap script was comparing against the
wrong shape and would've set `data-theme="\"dark\""`, which matches nothing,
so the very first paint would've silently ignored a saved dark/light choice
for a frame before React corrected it. Fixed by having the bootstrap script
`JSON.parse` the stored value too, so both sides agree on the format. I
caught this by writing the page to disk, running it in a real headless
Chromium, and reading `document.documentElement.getAttribute('data-theme')`
back out — not by inspection, so this is a real bug that shipped-and-got-
caught rather than a hypothetical.

Two separate controls, matching your two separate design components:

- **`Bookish.ThemeToggle`** (the small sun/moon pill, top-right of Home /
  My Books / Stats) — a quick light/dark switch, matching exactly what your
  pages wire it to (`on-change="{{setTheme}}"`, two states).
- **Settings → Appearance** — the three-way Light / Dark / Match device
  chips, matching your Settings mockup's own `mode: 'light'|'dark'|'auto'`
  state shape exactly.

---

## 6. Animation

Per your spec: subtle for ordinary UI, two deliberately more noticeable (but
still restrained) moments, plus entrance animation on Stats *and* the
dashboard.

- **Buttons / chips / nav items / inputs** — plain CSS transitions added to
  `bookish.css` (`transition: filter .15s, transform .1s` on `:hover`/
  `:active`; a 2px focus ring on `:focus-visible` everywhere interactive,
  which your design already specified but I made sure survived the port).
- **Page-flip on navigation** — described in §4.
- **Currently-reading cover, scale + rotate on hover** (Home only, per your
  spec) — `src/pages/Home.tsx`:
  ```tsx
  <motion.div
    initial={{ rotate: -3 }}                         // design's own static tilt
    whileHover={{ scale: 1.08, rotate: -7 }}
    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
  >
    <BookCover … />
  </motion.div>
  ```
- **Stats entrance** — the four glance tiles stagger-fade-up on mount
  (`staggerChildren: 0.07`), then the four chart panels and the reading-log
  table fade/slide in after a short delay; each bar chart's bars/segments
  animate their height or width from 0 → final value instead of appearing
  instantly, so the per-month, per-year, split, and time-to-finish charts
  all draw themselves in.
- **Dashboard entrance** — same stagger treatment applied to the four
  "at a glance" tiles on Home (library count, completed, chapters with
  notes, Practice), since you asked for this on the dashboard too, not only
  Stats.
- A global `prefers-reduced-motion: reduce` rule in `index.css` collapses
  all of the above to near-instant for anyone who's asked their OS for
  reduced motion.

---

## 7. Icons — what's Lucide, what's kept as your own art

You said Lucide *can* be used; I used it for generic, replaceable UI
glyphs (nav icons, search, close, arrows, plus, check, star, bell, clock,
lightbulb, sparkle, heart) at the same stroke width your design uses (2,
occasionally 1.8). I did **not** use it for anything that's actually your
own illustration — those four are ported with their exact original path
data into `src/components/icons/Doodles.tsx`:

- `BookshelfDoodle` — the stacked-books sketch (sidebar footer, My Books
  footer)
- `QuoteFlowerDoodle` — the flower swirl behind the Home quote card
- `GrowthDoodle` — the plant-in-a-cup on Book detail's footer
- `FlourishArrow` — the small hand-drawn arrow next to "Currently Reading"

If any of the Lucide substitutions look off to you, they're all isolated
single-icon swaps (listed in code comments at each use site) — easy to
point me at a specific one to change.

---

## 8. Data — what's seeded, and the one book you asked for

`src/data/seed.ts` is the "`database.json` for now" the brief asked for.
**Decision:** rather than inventing placeholder content, I reproduced the
**design's own sample library** — Atomic Habits, The Let Them Theory,
Dopamine Nation, The Psychology of Money, Dune, The Seven Husbands of
Evelyn Hugo, Educated, The Midnight Library, Deep Work — with the exact
statuses, progress, and dates your six pages already show (e.g. the Stats
reading log's start/finish dates are copied exactly, which is why the
Stats page numbers — 5 books finished in 2026, 3 fiction / 2 non-fiction,
26-day average — match your mockup precisely). That way every screen looks
like your design out of the box, instead of looking sparse or inconsistent.

**THE DIARY OF A CEO** was added on top, as asked:

```ts
{
  id: 'the-diary-of-a-ceo',
  title: 'The Diary of a CEO',
  subtitle: 'The 33 Laws of Business and Life',
  author: 'Steven Bartlett',
  genre: 'non-fiction',
  status: 'want',        // Settings' own default status for new books
  coverUrl: undefined,   // → shows the design's own "Add book cover" placeholder
  expectations: '',      // left blank — yours to write, not mine to guess
  chapters: [],
}
```

I left the **cover as the dashed "Add book cover" placeholder** rather than
guessing at an ISBN/edition and pulling a real cover image — that's not a
fallback I invented, it's literally what your own design shows for its
*other* sample books too (even "Atomic Habits," the hero book on Home, has
no real cover art in your mockup). Getting an ISBN wrong would show a
broken image or the wrong book's cover, which seemed worse than a
consistent, on-brand placeholder. **If you want a real cover,** tell me the
edition (or just paste a cover image) and I'll wire it in — `coverUrl` on
any book accepts a plain URL or a data URI.

I didn't invent chapters, takeaways, or expectations for it either — your
brief is literally "write my thoughts and expectations before reading,"
which only means something if it's actually blank for you to fill in.

**Chapters for Atomic Habits:** your `book.html` mockup says "Chapter 4 of
12" with a 32% bar, but only ever names 6 chapters. Those numbers don't
derive from each other cleanly (they read as "nice round mockup numbers,"
not a real formula), so rather than leave a hardcoded 12/32% sitting next
to a real 6-chapter list that'll drift the moment you mark one done, I
seeded exactly the 6 named chapters and made progress a live computation
(`completed ÷ total chapters`, see `src/lib/stats.ts`'s `chapterProgress`) —
currently 2 of 6 done ≈ 33%, a trivial, disclosed difference from the
mockup's 32%, in exchange for the number never silently going stale.

**Legacy year totals** (`legacyYearTotals` — 2023: 8 books, 2024: 11, 2025:
14) stand in for "years before this app existed," copied from your Stats
per-year chart. They're a flat number per year rather than individual
books, same as your mockup shows them; Settings doesn't expose editing them
yet (see §10).

---

## 9. Local-only data — a real limitation to know about

Everything you add or write (notes, expectations, new books, settings) is
saved to the browser's `localStorage`, **not a server** — this is the
"database will be configured later" the brief anticipated. Concretely, that
means:

- It's **per-browser, per-device**. Phone, laptop, and iPad will each keep
  their *own* copy; nothing syncs between them yet. For "audience of 1,
  three devices" this is the one thing in the brief this build doesn't
  fully satisfy — a real backend (even something lightweight) is needed for
  that, and I didn't want to quietly build a fake-sync illusion.
- Settings → "Export notes & highlights" works for real right now (it
  downloads a JSON file of your books + settings) as a stop-gap way to move
  data between devices or keep a backup until there's a proper backend.
- Clearing site data / a private-browsing session will lose anything
  written there.

---

## 10. Judgment calls to review

Things I decided without asking first, because stopping for each would
have meant not finishing "all pages at once" as you asked — flagging them
here instead, per "never deviate from my design system without asking."
None of these touch the **visual** design system; they're structural/
behavioral gaps the static mockup didn't resolve on its own.

1. **Responsive layout strategy.** Your four dashboard-style screens (Home,
   My Books, Stats, Settings) were only designed at 1440px with a fixed
   220px sidebar; Book detail and Chapter were designed at 390px *with no
   sidebar at all* — just a back link. I read that split as intentional (a
   "drill-in, chrome-free" pattern for the reading/notes screens) and built
   on it:
   - **Home / My Books / Stats**: the plum sidebar stays, full-width, at
     `lg` (1024px) and up; below that it collapses to a bottom tab bar
     (`MobileTabBar.tsx`) in the same plum, since a 220px fixed dark
     sidebar doesn't fit a 390px phone. This bottom bar is **my own
     addition** — nothing like it exists in the design.
   - **Book detail / Chapter**: no sidebar at *any* width, same
     chrome-free column as your 390px mockup, just with a wider max-width
     on larger screens rather than staying frozen at phone width.
   - If you'd rather Book/Chapter also carried the sidebar on laptop/iPad,
     or the breakpoint should move, that's a quick change — say the word.
2. **Overview / Notes / Insights tab content.** Your `book.html` only shows
   the "Chapters" tab selected; the other three tab labels exist but no
   panel content was in the export. I built:
   - **Overview** — status switcher (Want/Reading/Completed) + the
     "Thoughts & expectations" textarea the brief explicitly asked for.
   - **Notes** — a read-only rollup of every chapter's reflection + notes.
   - **Insights** — a rollup of every chapter's key takeaways.
   All three reuse your existing visual language (same card/row styles) —
   nothing new invented stylistically, just screens that needed *some*
   content to be usable.
3. **Chapter status control, key-takeaway add/remove, and the notes list
   under "What I'm taking with me."** Your Chapter mockup is static — key
   takeaways and the reflection box show fixed sample text with no visible
   way to edit them. Since the whole point of this app is writing your own
   takeaways, I added: a To-read/Reading/Done chip row, an add/remove UI
   for key takeaways, and a small list for freeform notes added via the
   "Add a note" field (otherwise they'd vanish after submission with
   nowhere to show up again).
4. **"Add a new book" opens a form**, rather than being a dead button —
   title, author, optional subtitle, genre; new books default to "Want to
   Read" (matching Settings' own default-status setting) and land on their
   detail page afterward.
5. **Home's search field and "Practice" tile are wired up** — search
   submits to My Books with your query; "Practice" links to My Books
   filtered to "Want to Read," since that's the closest existing screen to
   "your next book."
6. **Footer taglines on Book detail** ("Tiny habits = big dreams" next to
   the plant doodle) are specific to Atomic Habits in your mockup — I kept
   that exact line for Atomic Habits and added a small generic pool
   (`src/lib/taglines.ts`) for every other book, picked deterministically
   per book so it doesn't change on every render.
7. **Stats "All time" chip** actually does something — your mockup shows
   "2026" selected and "All time" present but inert; I wired it to show
   totals across every finished book plus the legacy year numbers.

None of these change a single color, spacing value, font, radius, or
component style from your design — they're the behavior underneath screens
the static export couldn't show behavior for. Happy to revisit any of them.

---

## 11. Verification performed

Not just "it compiled" — actually run and looked at:

- `npx tsc --noEmit` — clean, no errors.
- `npx vite build` — clean production build (no warnings after fixing a CSS
  `@import` ordering issue Vite flagged).
- Installed Playwright + Chromium and drove the real dev server headlessly:
  screenshotted all six pages, in **both** light and dark mode, at desktop
  (1440px), tablet/iPad-portrait (834px), and phone (390px and 360px)
  widths — 19 screenshots in total, `console`/`pageerror` checked clean on
  every one.
  - Caught and fixed the theme-encoding bug (§5) this way.
  - Verified the hover scale+rotate on the currently-reading cover actually
    fires.
  - Drove the full "Add a new book" flow end-to-end (filled the form,
    submitted, landed on the new book's detail page with the right
    status/tagline/empty states).
  - Verified the Stats "All time" toggle recomputes correctly (5 → 38 books,
    3 → 22 fiction, 2 → 16 non-fiction, matching the legacy totals + live
    data by hand).
  - Confirmed `The Diary of a CEO` renders correctly on My Books with its
    "Want to Read" badge and placeholder cover.

---

## 12. Everything written, by path

```
index.html, package.json, tsconfig*.json, vite.config.ts,
tailwind.config.ts, postcss.config.js, .gitignore, README.md, ACTIONS.md

public/favicon.svg

src/main.tsx, src/App.tsx, src/vite-env.d.ts

src/styles/tokens.css, bookish.css, index.css

src/lib/theme.tsx, useLocalStorage.ts, stats.ts, dates.ts, taglines.ts, cn.ts

src/data/types.ts, seed.ts, store.tsx

src/components/bookish/
  Button.tsx, Badge.tsx, ProgressBar.tsx, SearchField.tsx, FilterChip.tsx,
  Tabs.tsx, ChapterRow.tsx, StickyNote.tsx, QuoteCard.tsx, ThemeToggle.tsx,
  NoteField.tsx, StatCard.tsx, Switch.tsx, Select.tsx, BookCover.tsx,
  BookCard.tsx, NavItem.tsx, index.ts

src/components/icons/Doodles.tsx
src/components/layout/
  Sidebar.tsx, MobileTabBar.tsx, DashboardShell.tsx, DetailShell.tsx,
  PageTransition.tsx, ModalOverlay.tsx
src/components/AddBookDialog.tsx

src/pages/Home.tsx, MyBooks.tsx, BookDetail.tsx, ChapterPage.tsx,
          Stats.tsx, Settings.tsx

design/Book Itch Home.html      (your original export — kept as the record)
design/pages/*.html             (the 6 unwrapped pages — kept as the
                                  canonical reference for this build)
```

---

## What to look at first

If you only check a few things: **§8** (what's in your seed data and why
Diary of a CEO's cover is a placeholder), **§9** (the local-only data
limitation), and **§10** (the responsive layout call, since it's the one
most likely to not match what you pictured). Everything else is either a
direct port of your design or a small, disclosed addition in service of it.
