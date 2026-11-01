import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Heart, Pencil, Trash2 } from "lucide-react";
import { DetailShell } from "@/components/layout/DetailShell";
import {
  Badge,
  ProgressBar,
  Tabs,
  ChapterRow,
  FilterChip,
  NoteField,
} from "@/components/bookish";
import { BookCover } from "@/components/bookish/BookCover";
import { EditBookDialog } from "@/components/EditBookDialog";
import { GrowthDoodle } from "@/components/icons/Doodles";
import { useLibrary } from "@/data/store";
import { chapterProgress } from "@/lib/stats";
import { formatShortDate } from "@/lib/dates";
import { taglineFor } from "@/lib/taglines";
import { toInitialCaps } from "@/lib/text";
import type { ReadingStatus } from "@/data/types";

const TABS = ["Overview", "Chapters", "Notes", "Insights"];

export default function BookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const { getBook, setBookStatus, setExpectations, addChapter, setChapterState, deleteBook } = useLibrary();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Chapters");
  const [editOpen, setEditOpen] = useState(false);

  const book = bookId ? getBook(bookId) : undefined;
  if (!book) return <Navigate to="/books" replace />;

  const progress = chapterProgress(book);
  const tagline = taglineFor(book.id, book.title);

  function handleDelete() {
    if (!window.confirm(`Delete "${book!.title}"? This can't be undone.`)) return;
    deleteBook(book!.id);
    navigate("/books");
  }

  return (
    <DetailShell backTo="/books" backLabel="Back" maxWidthClassName="max-w-2xl lg:max-w-6xl">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-10">
        <section aria-label="Book summary" className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={book.status} />
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Edit book"
                onClick={() => setEditOpen(true)}
                className="flex size-8 shrink-0 items-center justify-center rounded-bk-pill text-ink-muted hover:bg-tint hover:text-ink"
              >
                <Pencil size={15} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Delete book"
                onClick={handleDelete}
                className="flex size-8 shrink-0 items-center justify-center rounded-bk-pill text-ink-muted hover:bg-tint hover:text-rust"
              >
                <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex items-start gap-5 lg:flex-col lg:items-stretch">
            <BookCover
              title={book.title}
              coverUrl={book.coverUrl}
              tone="tint"
              className="h-[160px] w-[120px] shrink-0 lg:h-[280px] lg:w-full"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-none">
              <h1 className="m-0 font-sans text-xl font-bold leading-7 text-ink sm:text-[22px]">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
                  {book.subtitle}
                </p>
              )}
              <p className="m-0 font-sans text-sm leading-[22px] text-ink-muted">
                {book.author}
              </p>
              {book.startedAt && (
                <p className="m-0 mt-2 font-sans text-xs leading-[18px] text-ink-muted">
                  Started:{" "}
                  <span className="font-semibold text-ink">
                    {formatShortDate(book.startedAt)}
                  </span>
                </p>
              )}
              {book.targetDate && (
                <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
                  Target:{" "}
                  <span className="font-semibold text-ink">
                    {formatShortDate(book.targetDate)}
                  </span>
                </p>
              )}
              {book.finishedAt && (
                <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
                  Finished:{" "}
                  <span className="font-semibold text-ink">
                    {formatShortDate(book.finishedAt)}
                  </span>
                </p>
              )}
              {progress.total > 0 && (
                <div className="mt-2">
                  <ProgressBar
                    value={progress.percent}
                    label={`${book.title} reading progress`}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-5">
          <Tabs tabs={TABS} value={tab} onChange={setTab} />

          {tab === "Overview" && (
            <OverviewTab
              book={book}
              onStatusChange={(s) => setBookStatus(book.id, s)}
              onExpectationsChange={(v) => setExpectations(book.id, v)}
            />
          )}

          {tab === "Chapters" && (
            <section aria-label="Chapters" className="flex flex-col gap-2">
              {book.chapters.length === 0 && (
                <p className="m-0 font-sans text-sm text-ink-muted">
                  No chapters yet — add your first one below once you start reading.
                </p>
              )}
              {book.chapters.map((c) => (
                <ChapterRow
                  key={c.id}
                  title={`Chapter ${c.number}: ${c.title}`}
                  state={c.state}
                  to={`/books/${book.id}/chapters/${c.id}`}
                  onToggleDone={() =>
                    setChapterState(book.id, c.id, c.state === "done" ? "todo" : "done")
                  }
                />
              ))}
              <NoteField
                placeholder="Add a chapter title..."
                onSubmit={(title) => addChapter(book.id, toInitialCaps(title))}
                className="mt-2 w-full"
              />
            </section>
          )}

          {tab === "Notes" && <NotesTab book={book} />}
          {tab === "Insights" && <InsightsTab book={book} />}
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-2">
        <p className="m-0 flex items-center gap-1.5 whitespace-pre-line font-script text-[22px] leading-[26px] text-ink">
          {tagline}
          <Heart
            size={18}
            strokeWidth={2}
            className="text-primary"
            aria-hidden="true"
          />
        </p>
        <GrowthDoodle />
      </div>

      {editOpen && <EditBookDialog book={book} onClose={() => setEditOpen(false)} />}
    </DetailShell>
  );
}

function OverviewTab({
  book,
  onStatusChange,
  onExpectationsChange,
}: {
  book: import("@/data/types").Book;
  onStatusChange: (status: ReadingStatus) => void;
  onExpectationsChange: (value: string) => void;
}) {
  return (
    <section aria-label="Overview" className="flex flex-col gap-5">
      <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
        <FilterChip
          active={book.status === "want"}
          onClick={() => onStatusChange("want")}
        >
          Want to Read
        </FilterChip>
        <FilterChip
          active={book.status === "reading"}
          onClick={() => onStatusChange("reading")}
        >
          Reading
        </FilterChip>
        <FilterChip
          active={book.status === "completed"}
          onClick={() => onStatusChange("completed")}
        >
          Completed
        </FilterChip>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">
          Thoughts &amp; expectations
        </h2>
        <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
          What are you hoping to get out of this one, before you dive in?
        </p>
        <textarea
          className="bk-input min-h-[120px] resize-y"
          value={book.expectations}
          onChange={(e) => onExpectationsChange(e.target.value)}
          placeholder="I picked this up because..."
        />
      </div>

      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-sm text-ink">
        <dt className="text-ink-muted">Genre</dt>
        <dd className="m-0 capitalize">{book.genre}</dd>
      </dl>
    </section>
  );
}

function NotesTab({ book }: { book: import("@/data/types").Book }) {
  const entries = book.chapters.filter(
    (c) => c.reflection || c.notes.length > 0,
  );
  if (entries.length === 0) {
    return (
      <p className="m-0 font-sans text-sm text-ink-muted">
        No notes yet — add some from a chapter's page.
      </p>
    );
  }
  return (
    <section aria-label="Notes" className="flex flex-col gap-3">
      {entries.map((c) => (
        <div
          key={c.id}
          className="rounded-bk-md border border-border bg-surface p-4"
        >
          <p className="m-0 font-sans text-[13px] font-semibold leading-[18px] text-ink">
            Chapter {c.number}: {c.title}
          </p>
          {c.reflection && (
            <p className="m-0 mt-2 font-script text-lg leading-6 text-ink">
              {c.reflection}
            </p>
          )}
          {c.notes.map((n) => (
            <p
              key={n.id}
              className="m-0 mt-2 font-sans text-sm leading-[22px] text-ink"
            >
              {n.text}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}

function InsightsTab({ book }: { book: import("@/data/types").Book }) {
  const withTakeaways = book.chapters.filter((c) => c.keyTakeaways.length > 0);
  if (withTakeaways.length === 0) {
    return (
      <p className="m-0 font-sans text-sm text-ink-muted">
        No key takeaways recorded yet.
      </p>
    );
  }
  return (
    <section aria-label="Insights" className="flex flex-col gap-3">
      {withTakeaways.map((c) => (
        <div
          key={c.id}
          className="rounded-bk-md border border-border bg-surface p-4"
        >
          <p className="m-0 font-sans text-[13px] font-semibold leading-[18px] text-ink">
            Chapter {c.number}: {c.title}
          </p>
          <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
            {c.keyTakeaways.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 font-sans text-sm leading-[22px] text-ink"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
