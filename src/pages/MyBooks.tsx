import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  SearchField,
  FilterChip,
  ThemeToggle,
  BookCard,
} from "@/components/bookish";
import { BookshelfDoodle } from "@/components/icons/Doodles";
import { AddBookDialog } from "@/components/AddBookDialog";
import { useLibrary } from "@/data/store";
import type { ReadingStatus } from "@/data/types";

type StatusFilter = "All" | ReadingStatus;
const FILTERS: StatusFilter[] = ["All", "reading", "completed", "want"];
const FILTER_LABEL: Record<StatusFilter, string> = {
  All: "All",
  reading: "Reading",
  completed: "Completed",
  want: "Want to Read",
};

export default function MyBooks() {
  const { books } = useLibrary();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [addOpen, setAddOpen] = useState(false);

  const statusFilter = (params.get("status") as StatusFilter | null) ?? "All";

  function setStatusFilter(status: StatusFilter) {
    const next = new URLSearchParams(params);
    if (status === "All") next.delete("status");
    else next.set("status", status);
    setParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [books, statusFilter, query]);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 basis-[280px]">
            <h1 className="m-0 font-sans text-[28px] font-bold leading-9 text-ink">
              My Books
            </h1>
            <p className="m-0 mt-1 font-sans text-sm leading-[22px] text-ink-muted">
              Your current reads, completed books and all the stories you're
              collecting.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-wrap items-center gap-4">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search your books..."
            className="max-w-[520px] flex-1 basis-[280px]"
          />
        </div>

        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              active={statusFilter === f}
              onClick={() => setStatusFilter(f)}
            >
              {FILTER_LABEL[f]}
            </FilterChip>
          ))}
        </div>

        {filtered.length > 0 ? (
          <section
            aria-label="Your books"
            className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
          >
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </section>
        ) : (
          <p className="m-0 font-sans text-sm text-ink-muted">
            No books match that search just yet.
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-5">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="add-btn inline-flex items-center gap-3 bg-transparent p-0 font-sans text-sm font-semibold text-ink"
          >
            <span className="flex size-11 items-center justify-center rounded-bk-pill bg-primary text-on-primary">
              <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            Add a new book
          </button>
          <div className="hidden items-end gap-4 sm:flex">
            <p className="m-0 max-w-[200px] -rotate-[4deg] font-script text-2xl text-ink">
              Good books build great minds
            </p>
            <BookshelfDoodle />
          </div>
        </div>
      </div>

      {addOpen && <AddBookDialog onClose={() => setAddOpen(false)} />}
    </DashboardShell>
  );
}
