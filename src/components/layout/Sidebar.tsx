import {
  Home,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  NotebookPen,
  Library,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { NavItem, NavItemDisabled } from "@/components/bookish";
import { BookshelfDoodle } from "@/components/icons/Doodles";

/**
 * The plum sidebar from design/pages/home.html (and my-books.html,
 * stats.html). "Notes & Insights" and "Library" are shown-but-inert —
 * the design references them via Bookish.NavItem with no href, i.e.
 * sections that exist in the design system but weren't built as pages
 * in this canvas. See ACTIONS.md.
 */
export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col gap-1 bg-plum p-4 pb-6 pt-7 text-on-plum lg:flex">
      <Link to="/" className="px-4 pb-5 no-underline">
        <p className="m-0 font-script text-[28px] font-semibold leading-[1.14] text-on-plum">
          Book Itch
        </p>
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
        <NavItem
          to="/"
          icon={
            <Home width={18} height={18} strokeWidth={2} aria-hidden="true" />
          }
        >
          Home
        </NavItem>
        <NavItem
          to="/books"
          icon={
            <BookOpen
              width={18}
              height={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          }
        >
          My Books
        </NavItem>
        <NavItemDisabled
          icon={
            <NotebookPen
              width={18}
              height={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          }
        >
          Notes &amp; Insights
        </NavItemDisabled>
        <NavItem
          to="/stats"
          icon={
            <BarChart3
              width={18}
              height={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          }
        >
          Stats
        </NavItem>
        <NavItemDisabled
          icon={
            <Library
              width={18}
              height={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          }
        >
          Library
        </NavItemDisabled>
        <Link
          to="/settings"
          state={{ backgroundLocation: location }}
          className="bk-nav"
          style={{ textDecoration: "none" }}
        >
          <SettingsIcon
            width={18}
            height={18}
            strokeWidth={2}
            aria-hidden="true"
          />
          Settings
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <p className="m-0 font-script text-[22px] leading-[26px] text-on-plum">
          Same girl... new chapter
        </p>
        <BookshelfDoodle />
      </div>
    </aside>
  );
}
