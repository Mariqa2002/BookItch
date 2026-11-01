# Book Itch

A personal reading tracker — what you're reading, what you want to read, your
thoughts and expectations before each book, and your takeaways chapter by
chapter, plus stats on your year and month.

Built from the "Book Itch" design (see `design/` and `ACTIONS.md`).

## Running it

Data is stored in a [Supabase](https://supabase.com) project, behind
Supabase Auth — you need a project and a signed-in account before the app
has anything to show.

1. Create a Supabase project (or use an existing one).
2. Apply the schema in `supabase/migrations/` to it — either paste each
   file's SQL into the Supabase dashboard's SQL editor, in order, or run
   `npx supabase link --project-ref <your-project-ref>` once and then
   `npx supabase db push`.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key (Supabase dashboard → Project Settings → API).
4. ```bash
   npm install
   npm run dev
   ```
5. Opens at `http://localhost:5173`. The app shows a sign-in/sign-up screen
   first — create an account there (email confirmation may be required
   depending on your project's auth settings).

`npm run build` produces a static `dist/` you can host anywhere (Netlify,
Vercel, GitHub Pages, etc.) — it's still a plain client-side app, just one
that talks to Supabase instead of `localStorage`. If you deploy it, set the
same two `VITE_SUPABASE_*` env vars in your host's build settings.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages
on every push to `main`. One-time setup, both in the repo on github.com:

1. **Settings → Pages → Build and deployment → Source: "GitHub Actions."**
   Without this the workflow runs but has nowhere to publish to.
2. **Settings → Secrets and variables → Actions → New repository secret** —
   add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values
   from your `.env.local`. The build needs them to produce a working bundle;
   without them it fails the same way `npm run build` would locally with no
   `.env.local` (see `src/lib/supabase.ts`).
3. In Supabase: **Authentication → URL Configuration** — add your Pages URL
   (`https://<your-username>.github.io/BookItch/`) to **Redirect URLs**, and
   update **Site URL** to it too if this becomes the primary place you use
   the app. Otherwise sign-up confirmation emails link back to `localhost`.

After that, every push to `main` redeploys automatically — check progress
under the repo's **Actions** tab. The site is served from `/BookItch/`
(`vite.config.ts`'s `base`), not the domain root, since this isn't a
`<username>.github.io` repo.

## Where things live

- `supabase/migrations/` — every change made to the database schema, in
  order. Run `npx supabase migration new <name>` to add a new one rather
  than editing an applied migration.
- `src/lib/supabase.ts` — the Supabase client, built from the
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars.
- `src/lib/auth.tsx` — sign-in/sign-up/sign-out and the current session.
- `src/pages/Login.tsx` — the sign-in/sign-up screen shown when signed out.
- `src/data/store.tsx` — reads/writes books, today's checklist, settings
  and legacy year totals from Supabase, scoped to the signed-in user.
- `src/styles/tokens.css` / `src/styles/bookish.css` — the design's own
  tokens and component CSS, ported verbatim.
- `src/components/bookish/` — the design system's components (Button,
  Badge, ProgressBar, …), matching the design's own naming.
- `src/pages/` — the seven screens (Home, My Books, Book, Chapter, Notes &amp;
  Insights, Stats, Settings).

See `ACTIONS.md` for the full build log, including every judgment call made
where the design didn't specify something.
