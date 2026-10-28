import { AWAKYN_THEME } from "./tokens";

/** Adds the theme's font stylesheet to the page once, so the font comes from tokens.ts alone. */
export function loadThemeFont() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = AWAKYN_THEME.fontStylesheet;
  document.head.appendChild(link);
}
