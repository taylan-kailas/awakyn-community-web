/**
 * The Awakyn look — the one file to edit to restyle the community app.
 * Colours come from the Awakyn design system (awakyn-website-v2/app/globals.css).
 * Swapping design systems later means replacing the values here (and the
 * images in public/awakyn/), then rebuilding.
 */

export type AwakynPalette = {
  bg: string;
  bg2: string;
  bg3: string;
  text: string;
  /** Quieter text; kept readable (at least 4.5:1) on every background. */
  muted: string;
  /** Selected items and filled tonal buttons; must stand out from bg2 and bg3. */
  selected: string;
  faint: string;
  onInk: string;
  danger: string;
  online: string;
};

export type AwakynTheme = {
  name: string;
  fontFamily: string;
  fontStylesheet: string;
  serverIconRadius: string;
  /** How every button reacts when pressed, and how a busy or disabled one looks. */
  press: { scale: number; fadedOpacity: number; durationMs: number };
  /** Logo painted through a CSS mask, relative to the app's base path. */
  logoMaskPath: string;
  light: AwakynPalette;
  dark: AwakynPalette;
};

export const AWAKYN_THEME: AwakynTheme = {
  name: "Awakyn",
  fontFamily: "Hanken Grotesk",
  fontStylesheet:
    "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  serverIconRadius: "16px",
  press: { scale: 0.95, fadedOpacity: 0.55, durationMs: 120 },
  logoMaskPath: "awakyn/lotus.png",
  light: {
    bg: "#f3eddd",
    bg2: "#ede6d2",
    bg3: "#e7dec8",
    text: "#2b2823",
    // The website's #8e8676 is too faint for small app text; darkened to read.
    muted: "#655e4f",
    selected: "#cdbe9d",
    faint: "#b7ae9b",
    onInk: "#f3eddd",
    // Awakyn has no warning/success colours; these sit in its warm range.
    danger: "#c0563f",
    online: "#6f9e6a",
  },
  dark: {
    bg: "#17130f",
    bg2: "#211b15",
    bg3: "#2a231b",
    text: "#ece4d3",
    // The website's #8c8375 is a touch faint on bg3; lightened to read.
    muted: "#a39886",
    selected: "#4a3d2e",
    faint: "#5e574c",
    onInk: "#1a1611",
    danger: "#e07a5f",
    online: "#6f9e6a",
  },
};
