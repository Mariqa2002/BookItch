import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
// Custom hook that behaves like useState but persists the value to localStorage.
// TODO: remove this local storage thing.
import { useLocalStorage } from "./useLocalStorage";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

// localStorage key the chosen mode is saved under. Comment notes it must match the
// inline script in index.html that sets the theme before React loads (avoids a flash of the wrong theme).
const STORAGE_KEY = "book-itch:theme-mode"; // kept in sync with the bootstrap script in index.html

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

// The React context itself, starting as null until a ThemeProvider supplies a value.
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Reads the OS/browser's color-scheme preference via a media query.
// Guard against server-side rendering (no `window`); otherwise check the media query match.
function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// Provider component: wraps the app and makes theme state available via context.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useLocalStorage<ThemeMode>(STORAGE_KEY, "auto");

  const resolved: ResolvedTheme =
    mode === "auto" ? (systemPrefersDark() ? "dark" : "light") : mode;

  // Whenever the resolved theme changes, reflect it on the <html> element so CSS can react to it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  // Keep the page in sync with the OS theme in real time while in 'auto' mode.
  useEffect(() => {
    if (mode !== "auto") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () =>
      document.documentElement.setAttribute(
        "data-theme",
        mql.matches ? "dark" : "light",
      );

    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  // Memoize the context value so consumers don't re-render unnecessarily when unrelated state changes.
  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  // Supply the theme value to all descendant components.
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Hook for consuming components to read/update the theme.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Fail loudly if used outside of a ThemeProvider, rather than silently returning undefined behavior.
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
