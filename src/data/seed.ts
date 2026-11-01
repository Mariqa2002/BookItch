import type { Settings } from "./types";

/** Settings row created for a user the first time they sign in. */
export const defaultSettings: Settings = {
  displayName: "Mariqa",
  yearlyGoal: 12,
  defaultStatusForNewBooks: "want",
  dailyReminder: true,
  reminderTime: "20:00",
  weeklySummary: false,
  goalMilestones: true,
  handwrittenTouches: true,
};
