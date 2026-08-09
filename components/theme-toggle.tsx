"use client";

import { getNextTheme, normalizeTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function setDocumentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still applies for this page when storage is unavailable.
  }
}

export function ThemeToggle() {
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Toggle color theme"
      title="Toggle light and dark mode"
      onClick={() => {
        const currentTheme = normalizeTheme(document.documentElement.dataset.theme) ?? "light";
        setDocumentTheme(getNextTheme(currentTheme));
      }}
    >
      <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
      </svg>
      <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
      </svg>
    </button>
  );
}
