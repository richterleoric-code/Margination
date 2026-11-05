import type { ReactNode } from "react";
import type { IllustrationMode } from "@shared/contract";
import { Star } from "./Star";

export type View = "read" | "library" | "settings";

type ShellProps = {
  view: View;
  mode: IllustrationMode | "checking";
  onView: (view: View) => void;
  children: ReactNode;
};

function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 5.5h6.2A2.8 2.8 0 0 1 14 8.3V19a2.2 2.2 0 0 0-2.2-2.2H5V5.5Z" />
      <path d="M19 5.5h-6.2A2.8 2.8 0 0 0 10 8.3V19a2.2 2.2 0 0 1 2.2-2.2H19V5.5Z" />
    </svg>
  );
}

function IconLibrary() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="5" width="6" height="6" />
      <rect x="14" y="5" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v2.2M12 17.3V19.5M4.5 12h2.2M17.3 12H19.5M6.4 6.4l1.6 1.6M16 16l1.6 1.6M17.6 6.4 16 8M8 16l-1.6 1.6" />
    </svg>
  );
}

export function Shell({ view, mode, onView, children }: ShellProps) {
  const modeClass = mode === "live" ? "is-live" : mode === "demonstration" ? "is-demo" : "";
  const modeLabel =
    mode === "live" ? "AI connected" : mode === "demonstration" ? "Demonstration mode" : "Checking connection";

  return (
    <div className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <Star size={34} />
          <div>
            <p className="wordmark">Margination</p>
            <p className="tagline">See the words.</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary">
          <button className={view === "read" ? "nav is-active" : "nav"} onClick={() => onView("read")} type="button">
            <IconBook /> Read
          </button>
          <button className={view === "library" ? "nav is-active" : "nav"} onClick={() => onView("library")} type="button">
            <IconLibrary /> Library
          </button>
          <button className={view === "settings" ? "nav is-active" : "nav"} onClick={() => onView("settings")} type="button">
            <IconSettings /> Settings
          </button>
        </nav>
        <div className="sidebar-foot">
          <p className={`mode-note ${modeClass}`}>{modeLabel}</p>
        </div>
      </aside>
      <div id="main">{children}</div>
    </div>
  );
}
