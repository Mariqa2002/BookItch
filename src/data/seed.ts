import type { Book, LegacyYearTotal, TodayItem, Settings } from "./types";

/**
 * Seed library — see ACTIONS.md "Seed data" for the full rationale.
 *
 * Short version: the design (design/pages/*.html) already has its own
 * sample books spread across the Home, My Books and Stats mockups
 * (Atomic Habits, The Let Them Theory, Dopamine Nation, Dune, The Seven
 * Husbands of Evelyn Hugo, The Psychology of Money, Deep Work, Educated,
 * The Midnight Library). Reproducing that same sample content here keeps
 * every page looking exactly like the design out of the box. "THE DIARY
 * OF A CEO" is the one book actually requested — added on top, status
 * "want to read" (the Settings page's own default for new books), cover
 * left as the "Add book cover" placeholder, and no invented chapters or
 * expectations text since those are yours to write.
 *
 * This whole file is the "database for now" the brief asked for — swap
 * it (or src/data/store.tsx's localStorage layer) for a real backend
 * later without touching any page component.
 */

export const seedBooks: Book[] = [];

/** Reading totals from years before this app existed — edit freely in Settings later. */
export const legacyYearTotals: LegacyYearTotal[] = [];

export const seedTodayItems: TodayItem[] = [];

export const defaultSettings: Settings = {
  displayName: "Mariqa",
  yearlyGoal: 12,
  defaultStatusForNewBooks: "want",
  dailyReminder: true,
  reminderTime: "20:00",
  weeklySummary: true,
  goalMilestones: true,
  handwrittenTouches: true,
};
