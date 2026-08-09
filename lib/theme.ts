export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "leslies-notes-theme";

export function normalizeTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function getNextTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}

export const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    const theme = stored === "light" || stored === "dark"
      ? stored
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    const theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }
})();`;
