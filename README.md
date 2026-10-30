# Book Itch

A personal reading tracker — what you're reading, what you want to read, your
thoughts and expectations before each book, and your takeaways chapter by
chapter, plus stats on your year and month.

Built from the "Book Itch" design (see `design/` and `ACTIONS.md`).

## Running it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. `npm run build` produces a static `dist/`
you can host anywhere (Netlify, Vercel, GitHub Pages, etc.) — it's a plain
client-side app with no server component.

## Where things live

- `src/data/seed.ts` — the starting library (your books, including *The
  Diary of a CEO*). This is the "database.json for now" the brief asked for.
- `src/data/store.tsx` — reads/writes that data, persisted to the browser's
  `localStorage` (per-device; see ACTIONS.md's "Local-only data" note).
- `src/styles/tokens.css` / `src/styles/bookish.css` — the design's own
  tokens and component CSS, ported verbatim.
- `src/components/bookish/` — the design system's components (Button,
  Badge, ProgressBar, …), matching the design's own naming.
- `src/pages/` — the six screens (Home, My Books, Book, Chapter, Stats,
  Settings).

See `ACTIONS.md` for the full build log, including every judgment call made
where the design didn't specify something.
