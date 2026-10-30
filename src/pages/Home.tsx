import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  CircleCheck,
  NotebookText,
  Star,
  ArrowRight,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  Button,
  ProgressBar,
  SearchField,
  StickyNote,
  QuoteCard,
  ThemeToggle,
} from "@/components/bookish";
import { BookCover } from "@/components/bookish/BookCover";
import { FlourishArrow, QuoteFlowerDoodle } from "@/components/icons/Doodles";
import { useLibrary } from "@/data/store";
import { chapterProgress, totalNotesCount } from "@/lib/stats";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

const glanceGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const glanceTile = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function Home() {
  const { books, todayItems, toggleTodayItem, settings } = useLibrary();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const currentlyReading = useMemo(() => {
    const reading = books.filter((b) => b.status === "reading");
    return reading
      .slice()
      .sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""))[0];
  }, [books]);

  const completedCount = books.filter((b) => b.status === "completed").length;
  const notesCount = totalNotesCount(books);
  const progress = currentlyReading ? chapterProgress(currentlyReading) : null;

  function handleSearchSubmit(value: string) {
    setQuery(value);
    navigate(`/books?q=${encodeURIComponent(value)}`);
  }

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-start gap-8 p-4">
        <div className="flex min-w-0 flex-1 basis-[480px] flex-col gap-8">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex-1 basis-[260px]">
              <h1 className="m-0 font-sans text-3xl font-bold leading-[44px] tracking-[-0.5px] text-ink sm:text-[36px]">
                <span className="block">{greeting()}</span>
                <span>{settings.displayName}</span>
              </h1>
              <p className="m-0 mt-2 font-sans text-sm leading-[22px] text-ink-muted">
                More books. More perspective. More you.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit(query);
                }}
                className="w-full max-w-full sm:w-[280px]"
              >
                <SearchField
                  value={query}
                  onChange={setQuery}
                  placeholder="Search your books..."
                  className="w-full max-w-full sm:w-[280px]"
                  aria-label="Search your books"
                />
              </form>
              <ThemeToggle />
            </div>
          </header>

          {currentlyReading ? (
            <section
              aria-label="Currently reading"
              className="relative flex flex-wrap items-center gap-5 rounded-bk-xl bg-tint p-6 shadow-bk-raised sm:gap-7"
            >
              <div className="flex basis-full items-end gap-2">
                <span className="font-script text-[28px] font-semibold leading-8 text-ink">
                  Currently Reading
                </span>
                <FlourishArrow className="text-primary" />
              </div>

              <motion.div
                className="shrink-0"
                initial={{ rotate: -3 }}
                whileHover={{ scale: 1.08, rotate: -7 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <BookCover
                  title={currentlyReading.title}
                  coverUrl={currentlyReading.coverUrl}
                  tone="surface"
                  className="h-[224px] w-[168px] shadow-bk-raised"
                />
              </motion.div>

              <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-3">
                <div>
                  <h2 className="m-0 font-sans text-xl font-bold leading-7 text-ink sm:text-[22px]">
                    {currentlyReading.title}
                  </h2>
                  <p className="m-0 mt-0.5 font-sans text-sm leading-[22px] text-ink-muted">
                    {currentlyReading.author}
                  </p>
                </div>
                {progress && progress.total > 0 && (
                  <div>
                    <ProgressBar
                      value={progress.percent}
                      label={`${currentlyReading.title} reading progress`}
                      className="max-w-[340px]"
                    />
                    <p className="m-0 mt-1 font-sans text-xs leading-[18px] text-ink-muted">
                      Chapter{" "}
                      {progress.currentChapterNumber ?? progress.completed} of{" "}
                      {progress.total}
                    </p>
                  </div>
                )}
                {currentlyReading.favoriteQuote && (
                  <p className="m-0 flex items-center gap-2 font-script text-[22px] leading-[26px] text-ink">
                    &ldquo;{currentlyReading.favoriteQuote}&rdquo;
                  </p>
                )}
                <Button
                  variant="deep"
                  arrow
                  className="self-start"
                  onClick={() => navigate(`/books/${currentlyReading.id}`)}
                >
                  View Notes
                </Button>
              </div>
            </section>
          ) : (
            <section className="rounded-bk-xl bg-tint p-6 shadow-bk-raised">
              <p className="m-0 font-script text-2xl text-ink">
                Nothing on the go right now.
              </p>
              <p className="m-0 mt-2 font-sans text-sm text-ink-muted">
                Pick something from{" "}
                <Link to="/books" className="font-semibold text-primary">
                  My Books
                </Link>{" "}
                and mark it as reading.
              </p>
            </section>
          )}

          <motion.section
            aria-label="Your reading at a glance"
            variants={glanceGrid}
            initial="hidden"
            animate="show"
            className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5"
          >
            <motion.div
              variants={glanceTile}
              className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-reading-bg text-reading-ink">
                <BookOpen size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 bk-stat">
                <p className="bk-stat__n">{books.length}</p>
                <p className="bk-stat__l">Books in your library</p>
              </div>
            </motion.div>

            <motion.div
              variants={glanceTile}
              className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-success-bg text-success-ink">
                <CircleCheck size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 bk-stat">
                <p className="bk-stat__n">{completedCount}</p>
                <p className="bk-stat__l">Books completed</p>
              </div>
            </motion.div>

            <motion.div
              variants={glanceTile}
              className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-want-bg text-want-ink">
                <NotebookText size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 bk-stat">
                <p className="bk-stat__n">{notesCount}</p>
                <p className="bk-stat__l">Chapters with notes</p>
              </div>
            </motion.div>

            <motion.div variants={glanceTile}>
              <Link
                to="/books?status=want"
                className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 no-underline shadow-bk-card"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-tint-strong text-primary">
                  <Star size={22} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-sans text-[17px] font-bold leading-6 text-ink">
                    Practice
                  </p>
                  <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
                    Your next book is calling...
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  strokeWidth={2}
                  className="text-ink-muted"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </motion.section>
        </div>

        <aside className="flex w-full max-w-[340px] shrink-0 flex-col gap-6 lg:w-[340px]">
          <StickyNote
            title="Today's Reading"
            items={todayItems}
            footer="Progress looks good on you"
            onToggle={toggleTodayItem}
          />
          <div className="relative pb-5">
            <QuoteCard
              quote="A reader lives a thousand lives before they die."
              author="George R.R. Martin"
            />
            <QuoteFlowerDoodle className="absolute bottom-0 right-1" />
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
