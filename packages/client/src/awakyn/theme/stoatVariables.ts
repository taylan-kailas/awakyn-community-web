import type { AwakynPalette, AwakynTheme } from "./tokens";

/** Stoat colour role → which Awakyn palette entry paints it. */
const ROLE_SOURCES: Record<string, keyof AwakynPalette> = {
  primary: "text",
  "on-primary": "onInk",
  "primary-container": "selected",
  "on-primary-container": "text",
  secondary: "text",
  "on-secondary": "onInk",
  "secondary-container": "selected",
  "on-secondary-container": "text",
  tertiary: "text",
  "on-tertiary": "onInk",
  "tertiary-container": "selected",
  "on-tertiary-container": "text",
  error: "danger",
  "on-error": "onInk",
  "error-container": "bg3",
  "on-error-container": "danger",
  "primary-fixed": "bg3",
  "primary-fixed-dim": "bg2",
  "on-primary-fixed": "text",
  "on-primary-fixed-variant": "muted",
  "secondary-fixed": "bg3",
  "secondary-fixed-dim": "bg2",
  "on-secondary-fixed": "text",
  "on-secondary-fixed-variant": "muted",
  "tertiary-fixed": "bg3",
  "tertiary-fixed-dim": "bg2",
  "on-tertiary-fixed": "text",
  "on-tertiary-fixed-variant": "muted",
  "surface-dim": "bg",
  surface: "bg",
  "surface-bright": "bg3",
  "surface-container-lowest": "bg",
  "surface-container-low": "bg2",
  "surface-container": "bg2",
  "surface-container-high": "bg3",
  "surface-container-highest": "bg3",
  "on-surface": "text",
  "on-surface-variant": "muted",
  outline: "muted",
  "outline-variant": "faint",
  "inverse-surface": "text",
  "inverse-on-surface": "bg",
  "inverse-primary": "selected",
  scrim: "text",
  shadow: "text",
};

function hexToTriplet(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

/**
 * CSS variables that repaint Stoat with `theme`. Applied after Stoat's own
 * variables, so they win whatever accent or font a member picked.
 */
export function stoatThemeVariables(theme: AwakynTheme, darkMode: boolean): Record<string, string> {
  const palette = darkMode ? theme.dark : theme.light;
  const variables: Record<string, string> = {
    "--fonts-primary": `"${theme.fontFamily}", "Inter", sans-serif`,
    "--awakyn-server-icon-radius": theme.serverIconRadius,
    "--brand-presence-online": palette.online,
  };
  for (const [role, source] of Object.entries(ROLE_SOURCES)) {
    variables[`--md-sys-color-${role}`] = palette[source];
    variables[`--mdui-color-${role}`] = hexToTriplet(palette[source]);
  }
  return variables;
}
